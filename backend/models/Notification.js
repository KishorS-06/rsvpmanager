import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['rsvp', 'event-update', 'reminder', 'system', 'comment', 'payment', 'checkin', 'invitation', 'cancellation'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  actionUrl: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
