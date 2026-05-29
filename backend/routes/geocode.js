import express from 'express';

const router = express.Router();

/**
 * GET /api/geocode/reverse?lat=&lon=
 * Proxies Nominatim reverse geocoding to avoid browser CORS restrictions.
 */
router.get('/reverse', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon query params are required' });
  }

  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  if (isNaN(latNum) || isNaN(lonNum)) {
    return res.status(400).json({ error: 'lat and lon must be valid numbers' });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latNum}&lon=${lonNum}&format=json`;
    const response = await fetch(url, {
      headers: {
        // Nominatim requires a User-Agent identifying your app
        'User-Agent': 'RSVPManager/2.0 (contact@rsvpmanager.com)'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Geocoding service error' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch geocoding data' });
  }
});

export default router;
