import QRCode from 'qrcode';
import logger from './logger.js';

/**
 * Generate QR code as data URL for an event
 */
export const generateEventQRCode = async (eventId) => {
  try {
    const url = `${process.env.FRONTEND_URL}/events/${eventId}`;
    return await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: { dark: '#4F46E5', light: '#FFFFFF' }
    });
  } catch (error) {
    logger.error('QR code generation error:', error);
    return null;
  }
};

/**
 * Generate QR code as data URL for a guest ticket
 */
export const generateGuestQRCode = async (qrCode) => {
  try {
    return await QRCode.toDataURL(qrCode, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1
    });
  } catch (error) {
    logger.error('Guest QR code generation error:', error);
    return null;
  }
};
