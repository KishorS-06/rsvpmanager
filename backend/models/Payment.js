import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  gateway: { type: String, enum: ['stripe', 'razorpay'], required: true },
  gatewayPaymentId: { type: String },
  gatewayOrderId: { type: String },
  gatewaySignature: { type: String },
  status: {
    type: String,
    enum: ['created', 'pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'created'
  },
  refundAmount: { type: Number, default: 0 },
  refundId: { type: String },
  refundReason: { type: String },
  couponCode: { type: String },
  discountAmount: { type: Number, default: 0 },
  metadata: { type: mongoose.Schema.Types.Mixed },
  invoiceNumber: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

paymentSchema.index({ event: 1 });
paymentSchema.index({ guest: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ gatewayPaymentId: 1 });

paymentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (!this.invoiceNumber && this.status === 'completed') {
    this.invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
