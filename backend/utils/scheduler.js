import cron from 'node-cron';
import Event from '../models/Event.js';
import Guest from '../models/Guest.js';
import { sendReminderEmail } from '../config/email.js';
import logger from './logger.js';

/**
 * Send automated reminders for upcoming events
 * Runs every hour
 */
export const startReminderScheduler = () => {
  cron.schedule('0 * * * *', async () => {
    logger.info('Running reminder scheduler...');
    try {
      const now = new Date();
      const events = await Event.find({
        status: 'published',
        'reminders.enabled': true
      });

      for (const event of events) {
        const eventStart = new Date(`${event.eventStartDate}T${event.eventStartTime}`);
        const hoursUntilEvent = (eventStart - now) / (1000 * 60 * 60);

        for (const reminderHours of (event.reminders.schedule || [24, 2])) {
          if (hoursUntilEvent <= reminderHours && hoursUntilEvent > reminderHours - 1) {
            const guests = await Guest.find({
              event: event._id,
              rsvpStatus: 'confirmed',
              reminderSent: false
            });

            for (const guest of guests) {
              try {
                await sendReminderEmail(guest, event);
                guest.reminderSent = true;
                guest.reminderSentAt = new Date();
                await guest.save();
              } catch (e) {
                logger.warn(`Reminder failed for ${guest.email}: ${e.message}`);
              }
            }

            if (guests.length > 0) {
              logger.info(`Sent ${guests.length} reminders for event: ${event.eventName}`);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Reminder scheduler error:', error);
    }
  });

  logger.info('Reminder scheduler started');
};

/**
 * Auto-close RSVP after deadline
 * Runs every 15 minutes
 */
export const startRsvpAutoClose = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const now = new Date();
      await Event.updateMany(
        {
          rsvpAutoClose: true,
          rsvpDeadline: { $lt: now },
          status: 'published'
        },
        { status: 'ongoing' }
      );
    } catch (error) {
      logger.error('RSVP auto-close error:', error);
    }
  });
};

/**
 * Mark events as completed after end date
 * Runs daily at midnight
 */
export const startEventStatusUpdater = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await Event.updateMany(
        { eventEndDate: { $lt: today }, status: { $in: ['published', 'ongoing'] } },
        { status: 'completed' }
      );
      logger.info('Event status updater ran successfully');
    } catch (error) {
      logger.error('Event status updater error:', error);
    }
  });
};
