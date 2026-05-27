import express from 'express';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import Event from '../models/Event.js';
import Guest from '../models/Guest.js';
import protect from '../middleware/auth.js';
import { sendEmail } from '../config/email.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Initialize payment gateways
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const razorpay = process.env.RAZORPAY_KEY_ID
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

// ─── CREATE STRIPE PAYMENT INTENT ────────────────────────────────────────────
router.post('/stripe/create-intent', protect, async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({ message: 'Stripe not configured' });

    const { eventId, guestId, couponCode } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!event.paymentRequired) return res.status(400).json({ message: 'Event does not require payment' });

    let amount = event.ticketPrice;
    let discountAmount = 0;

    // Apply coupon
    if (couponCode) {
      const coupon = event.coupons.find(
        (c) => c.code === couponCode.toUpperCase() && c.isActive && (!c.expiresAt || c.expiresAt > new Date())
      );
      if (coupon) {
        discountAmount = coupon.discountType === 'percentage'
          ? (amount * coupon.discountValue) / 100
          : coupon.discountValue;
        amount = Math.max(0, amount - discountAmount);
        coupon.usedCount = (coupon.usedCount || 0) + 1;
        await event.save();
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: event.currency.toLowerCase(),
      metadata: { eventId, guestId: guestId || '', userId: req.user._id.toString() }
    });

    // Create payment record
    const payment = await Payment.create({
      event: eventId,
      guest: guestId,
      user: req.user._id,
      amount,
      currency: event.currency,
      gateway: 'stripe',
      gatewayOrderId: paymentIntent.id,
      status: 'pending',
      couponCode,
      discountAmount
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
      amount,
      currency: event.currency
    });
  } catch (error) {
    logger.error('Stripe intent error:', error);
    res.status(500).json({ message: 'Payment initialization failed' });
  }
});

// ─── CONFIRM STRIPE PAYMENT ───────────────────────────────────────────────────
router.post('/stripe/confirm', protect, async (req, res) => {
  try {
    const { paymentIntentId, paymentId, guestId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { status: 'completed', gatewayPaymentId: paymentIntentId },
      { new: true }
    );

    if (guestId) {
      await Guest.findByIdAndUpdate(guestId, {
        paymentStatus: 'completed',
        paymentAmount: payment.amount,
        paymentId: paymentIntentId,
        paymentGateway: 'stripe',
        rsvpStatus: 'confirmed'
      });
    }

    // Update event revenue
    await Event.findByIdAndUpdate(payment.event, { $inc: { 'analytics.revenue': payment.amount } });

    res.json({ message: 'Payment confirmed', payment });
  } catch (error) {
    res.status(500).json({ message: 'Payment confirmation failed' });
  }
});

// ─── CREATE RAZORPAY ORDER ────────────────────────────────────────────────────
router.post('/razorpay/create-order', protect, async (req, res) => {
  try {
    if (!razorpay) return res.status(503).json({ message: 'Razorpay not configured' });

    const { eventId, guestId, couponCode } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    let amount = event.ticketPrice;
    let discountAmount = 0;

    if (couponCode) {
      const coupon = event.coupons.find(
        (c) => c.code === couponCode.toUpperCase() && c.isActive
      );
      if (coupon) {
        discountAmount = coupon.discountType === 'percentage'
          ? (amount * coupon.discountValue) / 100
          : coupon.discountValue;
        amount = Math.max(0, amount - discountAmount);
      }
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: event.currency === 'USD' ? 'INR' : event.currency,
      receipt: `rcpt_${Date.now()}`,
      notes: { eventId, guestId: guestId || '', userId: req.user._id.toString() }
    });

    const payment = await Payment.create({
      event: eventId,
      guest: guestId,
      user: req.user._id,
      amount,
      currency: event.currency,
      gateway: 'razorpay',
      gatewayOrderId: order.id,
      status: 'pending',
      couponCode,
      discountAmount
    });

    res.json({
      orderId: order.id,
      paymentId: payment._id,
      amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    logger.error('Razorpay order error:', error);
    res.status(500).json({ message: 'Payment initialization failed' });
  }
});

// ─── VERIFY RAZORPAY PAYMENT ──────────────────────────────────────────────────
router.post('/razorpay/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId, guestId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed - invalid signature' });
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: 'completed',
        gatewayPaymentId: razorpay_payment_id,
        gatewaySignature: razorpay_signature
      },
      { new: true }
    );

    if (guestId) {
      await Guest.findByIdAndUpdate(guestId, {
        paymentStatus: 'completed',
        paymentAmount: payment.amount,
        paymentId: razorpay_payment_id,
        paymentGateway: 'razorpay',
        rsvpStatus: 'confirmed'
      });
    }

    await Event.findByIdAndUpdate(payment.event, { $inc: { 'analytics.revenue': payment.amount } });

    res.json({ message: 'Payment verified successfully', payment });
  } catch (error) {
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

// ─── GET PAYMENT HISTORY ──────────────────────────────────────────────────────
router.get('/history', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [payments, total] = await Promise.all([
      Payment.find({ user: req.user._id })
        .populate('event', 'eventName eventStartDate')
        .populate('guest', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Payment.countDocuments({ user: req.user._id })
    ]);

    res.json({ payments, pagination: { current: parseInt(page), pages: Math.ceil(total / parseInt(limit)), total } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── STRIPE WEBHOOK ───────────────────────────────────────────────────────────
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!stripe) return res.status(503).send('Stripe not configured');

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      await Payment.findOneAndUpdate(
        { gatewayOrderId: pi.id },
        { status: 'completed', gatewayPaymentId: pi.id }
      );
    }

    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ message: 'Webhook error' });
  }
});

export default router;
