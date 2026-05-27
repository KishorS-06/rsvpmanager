import express from 'express';
import Event from '../models/Event.js';
import Guest from '../models/Guest.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import protect, { optionalAuth } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import upload from '../config/cloudinary.js';
import moment from 'moment';
import { generateICSFile, generateGoogleCalendarUrl } from '../utils/calendarExport.js';
import { generateEventQRCode } from '../utils/qrGenerator.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Helper: create notification
const createNotification = async (io, recipientId, data) => {
  try {
    const notification = await Notification.create({ recipient: recipientId, ...data });
    if (io) {
      io.to(`user-${recipientId}`).emit('notification', notification);
    }
  } catch (err) {
    logger.warn(`Notification creation failed: ${err.message}`);
  }
};

// ─── CREATE EVENT ────────────────────────────────────────────────────────────
router.post('/', protect, [
  body('eventName').notEmpty().trim().withMessage('Event name is required'),
  body('eventStartDate').notEmpty().withMessage('Event start date is required'),
  body('eventStartTime').notEmpty().withMessage('Event start time is required'),
  body('eventEndDate').notEmpty().withMessage('Event end date is required'),
  body('eventEndTime').notEmpty().withMessage('Event end time is required'),
  body('timezone').notEmpty().withMessage('Timezone is required'),
  body('selectedLocation.lat').isNumeric().withMessage('Valid latitude is required'),
  body('selectedLocation.lng').isNumeric().withMessage('Valid longitude is required'),
  body('eventUrl').notEmpty().withMessage('Event URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const event = await Event.create({ ...req.body, user: req.user._id });

    // Generate QR code for event
    try {
      const qrData = await generateEventQRCode(event._id.toString());
      event.qrCodeData = qrData;
    } catch (e) { /* non-critical */ }

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    logger.error('Event creation error:', error);
    res.status(500).json({ message: 'Server error during event creation' });
  }
});

// ─── UPLOAD COVER IMAGE ──────────────────────────────────────────────────────
router.post('/:id/cover-image', protect, upload.single('coverImage'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.file) {
      event.coverImage = req.file.path || `/uploads/${req.file.filename}`;
      if (req.file.public_id) event.coverImagePublicId = req.file.public_id;
      await event.save();
    }

    res.json({ message: 'Cover image uploaded successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Server error while uploading cover image' });
  }
});

// ─── GET USER EVENTS (with search, filter, pagination) ───────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const { status, category, search, sortBy = 'createdAt', order = 'desc', page = 1, limit = 12 } = req.query;

    const query = { user: req.user._id };
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { eventName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortObj = { [sortBy]: order === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, total] = await Promise.all([
      Event.find(query).sort(sortObj).skip(skip).limit(parseInt(limit)).lean(),
      Event.countDocuments(query)
    ]);

    res.json({
      events,
      pagination: { current: parseInt(page), pages: Math.ceil(total / parseInt(limit)), total }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching events' });
  }
});

// ─── PUBLIC EVENT DISCOVERY ──────────────────────────────────────────────────
router.get('/public/discover', optionalAuth, async (req, res) => {
  try {
    const { category, search, sortBy = 'eventStartDate', order = 'asc', page = 1, limit = 12 } = req.query;

    const query = { isPublic: true, status: 'published', eventStartDate: { $gte: moment().format('YYYY-MM-DD') } };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { eventName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'username profile.firstName profile.lastName profile.avatar')
        .lean(),
      Event.countDocuments(query)
    ]);

    res.json({ events, pagination: { current: parseInt(page), pages: Math.ceil(total / parseInt(limit)), total } });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching public events' });
  }
});

// ─── GET SINGLE EVENT ────────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('user', 'username profile.firstName profile.lastName profile.avatar')
      .lean();

    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.user._id.toString() !== req.user._id.toString() && !event.isPublic) {
      return res.status(403).json({ message: 'Not authorized to access this event' });
    }

    // Increment view count (non-blocking)
    if (event.isPublic) {
      Event.findByIdAndUpdate(req.params.id, { $inc: { 'analytics.views': 1 } }).exec();
    }

    const guestStats = await Guest.aggregate([
      { $match: { event: event._id } },
      { $group: { _id: '$rsvpStatus', count: { $sum: 1 } } }
    ]);

    const stats = { totalGuests: 0, confirmed: 0, declined: 0, pending: 0, waitlisted: 0, maybe: 0 };
    guestStats.forEach((s) => {
      stats[s._id] = s.count;
      stats.totalGuests += s.count;
    });

    res.json({ event, stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching event' });
  }
});

// ─── GET EVENT ANALYTICS ─────────────────────────────────────────────────────
router.get('/:id/analytics', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const guests = await Guest.find({ event: event._id }).lean();

    const analytics = {
      overview: {
        totalGuests: guests.length,
        confirmed: guests.filter((g) => g.rsvpStatus === 'confirmed').length,
        declined: guests.filter((g) => g.rsvpStatus === 'declined').length,
        pending: guests.filter((g) => g.rsvpStatus === 'pending').length,
        waitlisted: guests.filter((g) => g.rsvpStatus === 'waitlisted').length,
        maybe: guests.filter((g) => g.rsvpStatus === 'maybe').length,
        checkedIn: guests.filter((g) => g.checkInStatus === 'checked-in').length,
        capacityUtilization: event.capacity
          ? Math.round((event.currentAttendees / event.capacity) * 100)
          : 0,
        revenue: guests
          .filter((g) => g.paymentStatus === 'completed')
          .reduce((sum, g) => sum + (g.paymentAmount || 0), 0)
      },
      eventMetrics: {
        views: event.analytics.views,
        clicks: event.analytics.clicks,
        shares: event.analytics.shares,
        revenue: event.analytics.revenue
      },
      rsvpTimeline: guests.map((g) => ({ date: g.createdAt, status: g.rsvpStatus })),
      dietaryRestrictions: guests.reduce((acc, g) => {
        (g.dietaryRestrictions || []).forEach((d) => { acc[d] = (acc[d] || 0) + 1; });
        return acc;
      }, {}),
      checkInTimeline: guests
        .filter((g) => g.checkInTime)
        .map((g) => ({ time: g.checkInTime, name: g.name }))
        .sort((a, b) => new Date(a.time) - new Date(b.time))
    };

    res.json({ analytics });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching analytics' });
  }
});

// ─── UPDATE EVENT ────────────────────────────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Notify guests if event was updated and published
    if (req.body.status === 'published' && event.status !== 'published') {
      const guests = await Guest.find({ event: event._id, rsvpStatus: 'confirmed' }).select('email name');
      const io = req.app.get('io');
      await createNotification(io, event.user, {
        type: 'event-update',
        title: 'Event Published',
        message: `Your event "${event.eventName}" is now live!`,
        event: event._id
      });
    }

    res.json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating event' });
  }
});

// ─── CLONE EVENT ─────────────────────────────────────────────────────────────
router.post('/:id/clone', protect, async (req, res) => {
  try {
    const original = await Event.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Event not found' });
    if (original.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const cloneData = original.toObject();
    delete cloneData._id;
    delete cloneData.createdAt;
    delete cloneData.updatedAt;
    delete cloneData.eventSlug;
    cloneData.eventName = `${original.eventName} (Copy)`;
    cloneData.status = 'draft';
    cloneData.currentAttendees = 0;
    cloneData.analytics = { views: 0, clicks: 0, shares: 0, revenue: 0 };
    cloneData.guests = [];

    const cloned = await Event.create(cloneData);
    res.status(201).json({ message: 'Event cloned successfully', event: cloned });
  } catch (error) {
    res.status(500).json({ message: 'Server error while cloning event' });
  }
});

// ─── DELETE EVENT ────────────────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Promise.all([
      Guest.deleteMany({ event: event._id }),
      Comment.deleteMany({ event: event._id }),
      Notification.deleteMany({ event: event._id }),
      event.deleteOne()
    ]);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting event' });
  }
});

// ─── CALENDAR EXPORT ─────────────────────────────────────────────────────────
router.get('/:id/calendar/ics', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const icsContent = generateICSFile(event);
    if (!icsContent) return res.status(500).json({ message: 'Failed to generate ICS file' });

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="${event.eventName}.ics"`);
    res.send(icsContent);
  } catch (error) {
    res.status(500).json({ message: 'Server error while generating ICS file' });
  }
});

router.get('/:id/calendar/google', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ googleCalendarUrl: generateGoogleCalendarUrl(event) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── VALIDATE COUPON ─────────────────────────────────────────────────────────
router.post('/:id/validate-coupon', protect, async (req, res) => {
  try {
    const { code } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const coupon = event.coupons.find(
      (c) => c.code === code.toUpperCase() && c.isActive && (!c.expiresAt || c.expiresAt > new Date()) && (!c.maxUses || c.usedCount < c.maxUses)
    );

    if (!coupon) return res.status(400).json({ message: 'Invalid or expired coupon code' });

    const discount =
      coupon.discountType === 'percentage'
        ? (event.ticketPrice * coupon.discountValue) / 100
        : coupon.discountValue;

    res.json({
      valid: true,
      coupon: { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue },
      discount,
      finalPrice: Math.max(0, event.ticketPrice - discount)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
