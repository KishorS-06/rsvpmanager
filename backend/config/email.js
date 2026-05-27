import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

const createTransporter = () => {
  if (!process.env.SMTP_USER) {
    logger.warn('SMTP not configured - emails will not be sent');
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
};

export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return false;

    await transporter.sendMail({
      from: `"RSVP Manager" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    });

    logger.info(`Email sent to ${options.to}`);
    return true;
  } catch (error) {
    logger.error(`Email sending error: ${error.message}`);
    return false;
  }
};

const baseTemplate = (content) => `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;padding:20px;border-radius:12px">
    <div style="background:#4F46E5;padding:20px;border-radius:8px 8px 0 0;text-align:center">
      <h1 style="color:white;margin:0;font-size:24px">RSVP Manager</h1>
    </div>
    <div style="background:white;padding:30px;border-radius:0 0 8px 8px">
      ${content}
    </div>
    <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:20px">
      This is an automated message. Please do not reply to this email.
    </p>
  </div>
`;

export const sendInvitationEmail = async (guest, event) => {
  const html = baseTemplate(`
    <h2 style="color:#1f2937">You're Invited! 🎉</h2>
    <p>Dear <strong>${guest.name}</strong>,</p>
    <p>You have been invited to attend <strong>${event.eventName}</strong>!</p>
    <div style="background:#f3f4f6;padding:20px;border-radius:8px;margin:20px 0">
      <p><strong>📅 Date:</strong> ${event.eventStartDate} at ${event.eventStartTime}</p>
      <p><strong>🏁 End:</strong> ${event.eventEndDate} at ${event.eventEndTime}</p>
      <p><strong>📍 Location:</strong> ${event.selectedLocation?.address || 'See event page'}</p>
      <p><strong>🌍 Timezone:</strong> ${event.timezone}</p>
    </div>
    <a href="${process.env.FRONTEND_URL}/rsvp/${guest.qrCode}"
       style="background:#4F46E5;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;display:inline-block;margin:20px 0;font-weight:bold">
      RSVP Now
    </a>
    <p>Your RSVP Code: <strong style="font-size:18px;color:#4F46E5">${guest.ticketCode}</strong></p>
  `);

  return sendEmail({
    to: guest.email,
    subject: `You're Invited: ${event.eventName}`,
    html,
    text: `You're invited to ${event.eventName} on ${event.eventStartDate}. RSVP Code: ${guest.ticketCode}`
  });
};

export const sendReminderEmail = async (guest, event) => {
  const html = baseTemplate(`
    <h2 style="color:#1f2937">Event Reminder ⏰</h2>
    <p>Dear <strong>${guest.name}</strong>,</p>
    <p>This is a friendly reminder about <strong>${event.eventName}</strong>.</p>
    <div style="background:#FEF3C7;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #F59E0B">
      <p><strong>📅 Date:</strong> ${event.eventStartDate} at ${event.eventStartTime}</p>
      <p><strong>📍 Location:</strong> ${event.selectedLocation?.address || 'See event page'}</p>
    </div>
    <p>Your Ticket Code: <strong style="font-size:18px;color:#4F46E5">${guest.ticketCode}</strong></p>
    <p>We look forward to seeing you there!</p>
  `);

  return sendEmail({
    to: guest.email,
    subject: `Reminder: ${event.eventName}`,
    html,
    text: `Reminder: ${event.eventName} is on ${event.eventStartDate}. Ticket: ${guest.ticketCode}`
  });
};

export const sendConfirmationEmail = async (guest, event) => {
  const html = baseTemplate(`
    <h2 style="color:#1f2937">RSVP Confirmed! ✅</h2>
    <p>Dear <strong>${guest.name}</strong>,</p>
    <p>Your RSVP for <strong>${event.eventName}</strong> has been confirmed.</p>
    <div style="background:#D1FAE5;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #10B981">
      <p><strong>Event:</strong> ${event.eventName}</p>
      <p><strong>Date:</strong> ${event.eventStartDate} at ${event.eventStartTime}</p>
      <p><strong>Guests:</strong> ${guest.numberOfGuests}</p>
      <p><strong>Ticket Code:</strong> <span style="font-size:18px;font-weight:bold;color:#4F46E5">${guest.ticketCode}</span></p>
    </div>
    <p>Please save your ticket code for check-in at the event.</p>
  `);

  return sendEmail({
    to: guest.email,
    subject: `RSVP Confirmed: ${event.eventName}`,
    html,
    text: `Your RSVP for ${event.eventName} is confirmed. Ticket: ${guest.ticketCode}`
  });
};

export const sendCancellationEmail = async (guest, event, reason) => {
  const html = baseTemplate(`
    <h2 style="color:#DC2626">Event Cancelled ❌</h2>
    <p>Dear <strong>${guest.name}</strong>,</p>
    <p>We regret to inform you that <strong>${event.eventName}</strong> has been cancelled.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p>We apologize for any inconvenience caused.</p>
  `);

  return sendEmail({
    to: guest.email,
    subject: `Event Cancelled: ${event.eventName}`,
    html,
    text: `${event.eventName} has been cancelled. ${reason || ''}`
  });
};
