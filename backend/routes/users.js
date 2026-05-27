import express from 'express';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Guest from '../models/Guest.js';
import Payment from '../models/Payment.js';
import protect, { adminOnly } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { uploadAvatar } from '../config/cloudinary.js';
import logger from '../utils/logger.js';

const router = express.Router();
router.use(protect);

// ─── GET PROFILE ─────────────────────────────────────────────────────────────
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const eventCount = await Event.countDocuments({ user: req.user._id });

    res.json({
      user,
      stats: { totalEvents: eventCount, memberSince: user.createdAt }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// ─── UPDATE PROFILE ──────────────────────────────────────────────────────────
router.put('/profile', [
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('username').optional().isLength({ min: 4, max: 30 }).trim().withMessage('Username must be 4-30 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.body.username && req.body.username !== user.username) {
      const taken = await User.findOne({ username: req.body.username });
      if (taken) return res.status(400).json({ message: 'Username already taken' });
      user.username = req.body.username;
    }

    if (req.body.email && req.body.email !== user.email) {
      const taken = await User.findOne({ email: req.body.email });
      if (taken) return res.status(400).json({ message: 'Email already taken' });
      user.email = req.body.email;
      user.isEmailVerified = false;
    }

    if (req.body.profile) {
      user.profile = { ...user.profile.toObject(), ...req.body.profile };
    }

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// ─── UPLOAD AVATAR ───────────────────────────────────────────────────────────
router.post('/avatar', uploadAvatar.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (req.file) {
      user.profile.avatar = req.file.path || `/uploads/${req.file.filename}`;
      await user.save();
    }

    res.json({ message: 'Avatar uploaded successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error while uploading avatar' });
  }
});

// ─── UPDATE SETTINGS ─────────────────────────────────────────────────────────
router.put('/settings', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.settings = { ...user.settings.toObject(), ...req.body };
    await user.save();

    res.json({ message: 'Settings updated successfully', settings: user.settings });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating settings' });
  }
});

// ─── CHANGE PASSWORD ─────────────────────────────────────────────────────────
router.put('/password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = req.body.newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while changing password' });
  }
});

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────
router.get('/dashboard-stats', async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalEvents, upcomingEvents, pastEvents, guestAgg, recentEvents, revenueAgg] =
      await Promise.all([
        Event.countDocuments({ user: userId }),
        Event.countDocuments({ user: userId, eventStartDate: { $gte: today.toISOString().split('T')[0] } }),
        Event.countDocuments({ user: userId, eventStartDate: { $lt: today.toISOString().split('T')[0] } }),
        Guest.aggregate([
          {
            $lookup: {
              from: 'events',
              localField: 'event',
              foreignField: '_id',
              as: 'eventData'
            }
          },
          { $match: { 'eventData.user': userId } },
          {
            $group: {
              _id: '$rsvpStatus',
              count: { $sum: 1 }
            }
          }
        ]),
        Event.find({ user: userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('eventName eventStartDate eventEndDate status currentAttendees capacity category coverImage tags selectedLocation')
          .lean(),
        Payment.aggregate([
          {
            $lookup: {
              from: 'events',
              localField: 'event',
              foreignField: '_id',
              as: 'eventData'
            }
          },
          { $match: { 'eventData.user': userId, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      ]);

    const guestStats = { total: 0, confirmed: 0, declined: 0, pending: 0, waitlisted: 0, maybe: 0 };
    guestAgg.forEach((g) => {
      guestStats[g._id] = g.count;
      guestStats.total += g.count;
    });

    res.json({
      stats: {
        totalEvents,
        upcomingEvents,
        pastEvents,
        totalGuests: guestStats.total,
        confirmedGuests: guestStats.confirmed,
        pendingGuests: guestStats.pending,
        declinedGuests: guestStats.declined,
        totalRevenue: revenueAgg[0]?.total || 0
      },
      recentEvents
    });
  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard stats' });
  }
});

// ─── ADMIN: GET ALL USERS ────────────────────────────────────────────────────
router.get('/admin/all', adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query)
    ]);

    res.json({ users, pagination: { current: parseInt(page), pages: Math.ceil(total / parseInt(limit)), total } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── ADMIN: SUSPEND/ACTIVATE USER ────────────────────────────────────────────
router.put('/admin/:id/status', adminOnly, async (req, res) => {
  try {
    const { isActive, reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot modify admin accounts' });

    user.isActive = isActive;
    if (!isActive) { user.suspendedAt = new Date(); user.suspendedReason = reason; }
    else { user.suspendedAt = undefined; user.suspendedReason = undefined; }
    await user.save();

    res.json({ message: `User ${isActive ? 'activated' : 'suspended'} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── ADMIN: CHANGE USER ROLE ─────────────────────────────────────────────────
router.put('/admin/:id/role', adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'organizer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── ADMIN: PLATFORM ANALYTICS ───────────────────────────────────────────────
router.get('/admin/analytics', adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalEvents, totalGuests, totalRevenue, recentUsers, topEvents] =
      await Promise.all([
        User.countDocuments(),
        Event.countDocuments(),
        Guest.countDocuments(),
        Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        User.find().sort({ createdAt: -1 }).limit(5).select('username email role createdAt'),
        Event.find().sort({ 'analytics.views': -1 }).limit(5).select('eventName analytics currentAttendees status')
      ]);

    res.json({
      stats: {
        totalUsers,
        totalEvents,
        totalGuests,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentUsers,
      topEvents
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
