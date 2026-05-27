import mongoose from 'mongoose';

const customQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ['text', 'multiple-choice', 'checkbox', 'date', 'number'], default: 'text' },
  required: { type: Boolean, default: false },
  options: [String]
}, { _id: true });

const eventSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: [true, 'Please provide an event name'],
    trim: true,
    maxlength: [200, 'Event name cannot exceed 200 characters']
  },
  eventSlug: { type: String, unique: true, trim: true },
  description: { type: String, default: '', maxlength: 5000 },
  eventStartDate: { type: String, required: [true, 'Please provide an event start date'] },
  eventStartTime: { type: String, required: [true, 'Please provide an event start time'] },
  eventEndDate: { type: String, required: [true, 'Please provide an event end date'] },
  eventEndTime: { type: String, required: [true, 'Please provide an event end time'] },
  timezone: { type: String, required: true, default: 'UTC' },
  selectedLocation: {
    lat: { type: Number, required: [true, 'Please provide latitude'] },
    lng: { type: Number, required: [true, 'Please provide longitude'] },
    address: { type: String, default: '' },
    venueName: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: '' }
  },
  eventUrl: { type: String, required: [true, 'Please provide an event URL'], trim: true },
  coverImage: { type: String, default: '' },
  coverImagePublicId: { type: String, default: '' },
  category: {
    type: String,
    enum: ['conference', 'workshop', 'party', 'wedding', 'concert', 'sports', 'meetup', 'corporate', 'fundraiser', 'festival', 'other'],
    default: 'other'
  },
  tags: [{ type: String, trim: true }],
  capacity: { type: Number, default: null },
  currentAttendees: { type: Number, default: 0 },
  waitlistEnabled: { type: Boolean, default: false },
  waitlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guest' }],
  isPublic: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  // RSVP settings
  rsvpDeadline: { type: Date },
  rsvpAutoClose: { type: Boolean, default: false },
  rsvpApprovalRequired: { type: Boolean, default: false },
  allowMaybe: { type: Boolean, default: true },
  // Payment
  paymentRequired: { type: Boolean, default: false },
  ticketPrice: { type: Number, default: 0 },
  currency: { type: String, default: 'USD' },
  paymentGateway: { type: String, enum: ['stripe', 'razorpay', 'none'], default: 'none' },
  stripeProductId: { type: String },
  stripePriceId: { type: String },
  // Recurring
  isRecurring: { type: Boolean, default: false },
  recurringPattern: {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
    interval: { type: Number, default: 1 },
    endDate: { type: Date },
    occurrences: { type: Number }
  },
  parentEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  // Organizer
  organizer: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  // Custom questions for RSVP
  customQuestions: [customQuestionSchema],
  // Reminders
  reminders: {
    enabled: { type: Boolean, default: true },
    schedule: [{ type: Number }] // hours before event
  },
  // Coupons
  coupons: [{
    code: { type: String, uppercase: true },
    discountType: { type: String, enum: ['percentage', 'fixed'] },
    discountValue: { type: Number },
    maxUses: { type: Number },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true }
  }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  guests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guest' }],
  analytics: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes
eventSchema.index({ user: 1, status: 1 });
eventSchema.index({ eventStartDate: 1 });
eventSchema.index({ isPublic: 1, status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ eventSlug: 1 });
eventSchema.index({ 'selectedLocation.city': 1 });

// Pre-save: slug generation + timestamp
eventSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (!this.eventSlug && this.eventName) {
    this.eventSlug =
      this.eventName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') +
      '-' +
      Date.now().toString(36);
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
