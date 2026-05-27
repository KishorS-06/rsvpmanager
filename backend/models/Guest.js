import mongoose from 'mongoose';

const guestSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please provide guest name'], trim: true },
  email: {
    type: String,
    required: [true, 'Please provide guest email'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: { type: String, default: '' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  rsvpStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'declined', 'waitlisted', 'maybe'],
    default: 'pending'
  },
  numberOfGuests: { type: Number, default: 1, min: 1, max: 20 },
  dietaryRestrictions: [{ type: String }],
  specialRequirements: { type: String, default: '' },
  customAnswers: [{ question: String, answer: mongoose.Schema.Types.Mixed }],
  checkInStatus: {
    type: String,
    enum: ['not-checked-in', 'checked-in'],
    default: 'not-checked-in'
  },
  checkInTime: { type: Date },
  qrCode: { type: String, unique: true, sparse: true },
  ticketCode: { type: String, unique: true, sparse: true },
  // Payment
  paymentStatus: {
    type: String,
    enum: ['not-required', 'pending', 'completed', 'refunded', 'failed'],
    default: 'not-required'
  },
  paymentAmount: { type: Number, default: 0 },
  paymentId: { type: String },
  paymentGateway: { type: String, enum: ['stripe', 'razorpay', 'none'], default: 'none' },
  couponCode: { type: String },
  discountAmount: { type: Number, default: 0 },
  // VIP
  isVip: { type: Boolean, default: false },
  vipNotes: { type: String, default: '' },
  // Notes
  notes: { type: String, default: '' },
  tags: [{ type: String }],
  // Email tracking
  reminderSent: { type: Boolean, default: false },
  reminderSentAt: { type: Date },
  invitationSent: { type: Boolean, default: false },
  invitationSentAt: { type: Date },
  confirmationSent: { type: Boolean, default: false },
  // Source
  source: { type: String, enum: ['manual', 'import', 'self-rsvp', 'invitation'], default: 'manual' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
guestSchema.index({ email: 1, event: 1 }, { unique: true });
guestSchema.index({ rsvpStatus: 1 });
guestSchema.index({ event: 1, rsvpStatus: 1 });
guestSchema.index({ event: 1, checkInStatus: 1 });
guestSchema.index({ ticketCode: 1 });
guestSchema.index({ qrCode: 1 });

// Pre-save: generate codes + timestamp
guestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (!this.qrCode) {
    this.qrCode = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  if (!this.ticketCode) {
    this.ticketCode = `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

const Guest = mongoose.model('Guest', guestSchema);
export default Guest;
