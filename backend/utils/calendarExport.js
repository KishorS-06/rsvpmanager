import ical from 'ical-generator';
import logger from './logger.js';

export const generateICSFile = (event) => {
  try {
    const cal = ical({ name: 'RSVP Manager' });

    const startDate = new Date(`${event.eventStartDate}T${event.eventStartTime}`);
    const endDate = new Date(`${event.eventEndDate}T${event.eventEndTime}`);

    cal.createEvent({
      start: startDate,
      end: endDate,
      summary: event.eventName,
      description: event.description || '',
      location: event.selectedLocation?.address || `${event.selectedLocation?.lat}, ${event.selectedLocation?.lng}`,
      url: event.eventUrl,
      organizer: {
        name: event.organizer?.name || 'Event Organizer',
        email: event.organizer?.email || 'noreply@rsvpmanager.com'
      },
      status: event.status === 'published' ? 'CONFIRMED' : 'TENTATIVE'
    });

    return cal.toString();
  } catch (error) {
    logger.error('ICS generation error:', error);
    return null;
  }
};

export const generateGoogleCalendarUrl = (event) => {
  try {
    const startDate = new Date(`${event.eventStartDate}T${event.eventStartTime}`);
    const endDate = new Date(`${event.eventEndDate}T${event.eventEndTime}`);

    const formatDate = (date) =>
      date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.eventName,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: event.description || '',
      location: event.selectedLocation?.address || `${event.selectedLocation?.lat}, ${event.selectedLocation?.lng}`,
      sprop: `website:${event.eventUrl}`
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch (error) {
    logger.error('Google Calendar URL error:', error);
    return null;
  }
};
