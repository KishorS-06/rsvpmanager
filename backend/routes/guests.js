import express from 'express';
import Guest from '../models/Guest.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import protect from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { sendInvitationEmail, sendReminderEmail, sendConfirmationEmail } from '../config/email.js';
import QRCode from 'qrcode';
import XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import logger from '../utils/logger.js';

const router = express.Router();
router.use(protect);

// Helper: create notification
const notify = async (io, recipientId, data) => {
  try {
    const n = await Notification.create({ recipient: recipientId, ...data });
    if (io) io.to(`user-${recipientId}`).emit('notification', n);
  } catch (e) { logger.warn(`Notify failed: ${e.message}`); }
};

// ─── ADD GUEST ───────────────────────────────────────────────────────────────
router.post('/', [
  body('name').notEmpty().trim().withMessage('Guest name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('event').isMongoId().withMessage('Valid event ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const event = await Event.findById(req.body.event);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add guests to this event' });
    }

    // Check for duplicate
    const existing = await Guest.findOne({ email: req.body.email, event: req.body.event });
    if (existing) return res.status(400).json({ message: 'Guest with this email already exists for this event' });

    // Capacity check
    let rsvpStatus = req.body.rsvpStatus || 'pending';
    if (event.capacity && event.currentAttendees >= event.capacity) {
      if (event.waitlistEnabled) {
        rsvpStatus = 'waitlisted';
      } else {
        return res.status(400).json({ message: 'Event is at full capacity' });
      }
    }

    const guest = await Guest.create({
      ...req.body,
      rsvpStatus,
      createdBy: req.user._id,
      source: 'manual'
    });

    // Update event attendee count
    if (rsvpStatus === 'confirmed') {
      await Event.findByIdAndUpdate(req.body.event, { $inc: { currentAttendees: 1 } });
    }

    // Send invitation email
    if (req.body.sendInvitation) {
      await sendInvitationEmail(guest, event);
      await Guest.findByIdAndUpdate(guest._id, { invitationSent: true, invitationSentAt: new Date() });
    }

    // Notify event owner
    const io = req.app.get('io');
    await notify(io, event.user, {
      type: 'rsvp',
      title: 'New Guest Added',
      message: `${guest.name} has been added to "${event.eventName}"`,
      event: event._id,
      guest: guest._id
    });

    res.status(201).json({ message: 'Guest added successfully', guest });
  } catch (error) {
    logger.error('Add guest error:', error);
    if (error.code === 11000) return res.status(400).json({ message: 'Guest already exists for this event' });
    res.status(500).json({ message: 'Server error while adding guest' });
  }
});

// ─── BULK IMPORT GUESTS (CSV/Excel) ──────────────────────────────────────────
router.post('/import/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { guests: guestList } = req.body; // Array of { name, email, phone }
    if (!Array.isArray(guestList) || guestList.length === 0) {
      return res.status(400).json({ message: 'No guests provided' });
    }

    const results = { added: 0, skipped: 0, errors: [] };

    for (const g of guestList) {
      try {
        if (!g.name || !g.email) { results.errors.push(`Missing name/email for row`); continue; }
        const exists = await Guest.findOne({ email: g.email.toLowerCase(), event: event._id });
        if (exists) { results.skipped++; continue; }

        await Guest.create({
          name: g.name,
          email: g.email.toLowerCase(),
          phone: g.phone || '',
          event: event._id,
          createdBy: req.user._id,
          source: 'import'
        });
        results.added++;
      } catch (e) {
        results.errors.push(`${g.email}: ${e.message}`);
      }
    }

    res.json({ message: `Import complete: ${results.added} added, ${results.skipped} skipped`, results });
  } catch (error) {
    res.status(500).json({ message: 'Server error during import' });
  }
});

// ─── GET GUESTS FOR EVENT ────────────────────────────────────────────────────
router.get('/event/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { search, rsvpStatus, checkInStatus, page = 1, limit = 50 } = req.query;
    const query = { event: req.params.eventId };
    if (rsvpStatus && rsvpStatus !== 'all') query.rsvpStatus = rsvpStatus;
    if (checkInStatus && checkInStatus !== 'all') query.checkInStatus = checkInStatus;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [guests, total] = await Promise.all([
      Guest.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Guest.countDocuments(query)
    ]);

    const allGuests = await Guest.find({ event: req.params.eventId }).lean();
    const stats = {
      total: allGuests.length,
      confirmed: allGuests.filter((g) => g.rsvpStatus === 'confirmed').length,
      declined: allGuests.filter((g) => g.rsvpStatus === 'declined').length,
      pending: allGuests.filter((g) => g.rsvpStatus === 'pending').length,
      waitlisted: allGuests.filter((g) => g.rsvpStatus === 'waitlisted').length,
      maybe: allGuests.filter((g) => g.rsvpStatus === 'maybe').length,
      checkedIn: allGuests.filter((g) => g.checkInStatus === 'checked-in').length
    };

    res.json({ guests, stats, pagination: { current: parseInt(page), pages: Math.ceil(total / parseInt(limit)), total } });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching guests' });
  }
});

// ─── EXPORT GUESTS ───────────────────────────────────────────────────────────
router.get('/event/:eventId/export/:format', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const guests = await Guest.find({ event: req.params.eventId }).lean();
    const format = req.params.format;

    const data = guests.map((g) => ({
      Name: g.name,
      Email: g.email,
      Phone: g.phone || '',
      'RSVP Status': g.rsvpStatus,
      'Check-in': g.checkInStatus,
      'Number of Guests': g.numberOfGuests,
      'Ticket Code': g.ticketCode,
      VIP: g.isVip ? 'Yes' : 'No',
      'Added On': new Date(g.createdAt).toLocaleDateString()
    }));

    if (format === 'csv') {
      const headers = Object.keys(data[0] || {}).join(',');
      const rows = data.map((row) => Object.values(row).map((v) => `"${v}"`).join(','));
      const csv = [headers, ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${event.eventName}-guests.csv"`);
      return res.send(csv);
    }

    if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Guests');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${event.eventName}-guests.xlsx"`);
      return res.send(buffer);
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 30 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${event.eventName}-guests.pdf"`);
      doc.pipe(res);
      doc.fontSize(18).text(`Guest List: ${event.eventName}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10);
      data.forEach((g, i) => {
        doc.text(`${i + 1}. ${g.Name} (${g.Email}) - ${g['RSVP Status']} - Ticket: ${g['Ticket Code']}`);
      });
      doc.end();
      return;
    }

    res.status(400).json({ message: 'Invalid format. Use csv, excel, or pdf' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during export' });
  }
});

// ─── UPDATE RSVP STATUS ──────────────────────────────────────────────────────
router.put('/:id/rsvp', [
  body('rsvpStatus').isIn(['pending', 'confirmed', 'declined', 'waitlisted', 'maybe'])
    .withMessage('Valid RSVP status is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const guest = await Guest.findById(req.params.id);
    if (!guest) return res.status(404).json({ message: 'Guest not found' });

    const event = await Event.findById(guest.event);
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const prevStatus = guest.rsvpStatus;
    guest.rsvpStatus = req.body.rsvpStatus;
    await guest.save();

    // Update attendee count
    if (req.body.rsvpStatus === 'confirmed' && prevStatus !== 'confirmed') {
      await Event.findByIdAndUpdate(event._id, { $inc: { currentAttendees: guest.numberOfGuests } });
    } else if (prevStatus === 'confirmed' && req.body.rsvpStatus !== 'confirmed') {
      await Event.findByIdAndUpdate(event._id, { $inc: { currentAttendees: -guest.numberOfGuests } });
    }

    // Send confirmation email
    if (req.body.rsvpStatus === 'confirmed' && req.body.sendConfirmation !== false) {
      sendConfirmationEmail(guest, event).catch((e) => logger.warn(`Confirmation email failed: ${e.message}`));
    }

    // Notify event owner
    const io = req.app.get('io');
    await notify(io, event.user, {
      type: 'rsvp',
      title: 'RSVP Updated',
      message: `${guest.name}'s RSVP changed to ${req.body.rsvpStatus}`,
      event: event._id,
      guest: guest._id
    });

    res.json({ message: 'RSVP status updated successfully', guest });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating RSVP' });
  }
});

// ─── CHECK IN GUEST ──────────────────────────────────────────────────────────
router.put('/:id/checkin', async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) return res.status(404).json({ message: 'Guest not found' });

    const event = await Event.findById(guest.event);
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (guest.checkInStatus === 'checked-in') {
      return res.status(400).json({ message: 'Guest already checked in', guest });
    }

    guest.checkInStatus = 'checked-in';
    guest.checkInTime = new Date();
    await guest.save();

    const io = req.app.get('io');
    io?.to(`event-${event._id}`).emit('guest-checkin', { guestId: guest._id, name: guest.name });

    res.json({ message: 'Guest checked in successfully', guest });
  } catch (error) {
    res.status(500).json({ message: 'Server error while checking in guest' });
  }
});

// ─── CHECK IN BY QR CODE ─────────────────────────────────────────────────────
router.post('/checkin-by-qr', async (req, res) => {
  try {
    const { qrCode, eventId } = req.body;
    const guest = await Guest.findOne({ qrCode, event: eventId });
    if (!guest) return res.status(404).json({ message: 'Invalid QR code or guest not found' });

    const event = await Event.findById(eventId);
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (guest.checkInStatus === 'checked-in') {
      return res.status(400).json({ message: 'Guest already checked in', guest });
    }

    guest.checkInStatus = 'checked-in';
    guest.checkInTime = new Date();
    await guest.save();

    res.json({ message: 'Guest checked in successfully', guest });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── SEND REMINDER ───────────────────────────────────────────────────────────
router.post('/:id/remind', async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) return res.status(404).json({ message: 'Guest not found' });

    const event = await Event.findById(guest.event);
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const sent = await sendReminderEmail(guest, event);
    if (sent) {
      guest.reminderSent = true;
      guest.reminderSentAt = new Date();
      await guest.save();
    }

    res.json({ message: sent ? 'Reminder sent successfully' : 'Failed to send reminder', sent });
  } catch (error) {
    res.status(500).json({ message: 'Server error while sending reminder' });
  }
});

// ─── BULK SEND INVITATIONS ───────────────────────────────────────────────────
router.post('/bulk-invite/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { guestIds } = req.body;
    const guests = await Guest.find({ _id: { $in: guestIds }, event: event._id });

    let sent = 0;
    for (const guest of guests) {
      try {
        await sendInvitationEmail(guest, event);
        guest.invitationSent = true;
        guest.invitationSentAt = new Date();
        await guest.save();
        sent++;
      } catch (e) { /* continue */ }
    }

    res.json({ message: `Invitations sent to ${sent} guests` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── UPDATE GUEST ────────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) return res.status(404).json({ message: 'Guest not found' });

    const event = await Event.findById(guest.event);
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ message: 'Guest updated successfully', guest: updated });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── DELETE GUEST ────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) return res.status(404).json({ message: 'Guest not found' });

    const event = await Event.findById(guest.event);
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (guest.rsvpStatus === 'confirmed') {
      await Event.findByIdAndUpdate(event._id, { $inc: { currentAttendees: -guest.numberOfGuests } });
    }

    await guest.deleteOne();
    res.json({ message: 'Guest removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while removing guest' });
  }
});

// ─── GET SINGLE GUEST ────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id).populate('event', 'eventName eventStartDate');
    if (!guest) return res.status(404).json({ message: 'Guest not found' });

    const event = await Event.findById(guest.event._id || guest.event);
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(guest.qrCode);
    res.json({ guest: { ...guest.toObject(), qrCodeImage } });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching guest' });
  }
});

export default router;
