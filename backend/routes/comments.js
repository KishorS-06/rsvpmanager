import express from 'express';
import Comment from '../models/Comment.js';
import Event from '../models/Event.js';
import protect from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();
router.use(protect);

// @route   POST /api/comments
// @desc    Create a new comment
// @access  Private
router.post('/', [
  body('content').notEmpty().withMessage('Comment content is required'),
  body('event').isMongoId().withMessage('Valid event ID is required'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.body.event);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.isPublic) {
      return res.status(403).json({ message: 'Cannot comment on private events' });
    }

    const commentData = {
      content: req.body.content,
      rating: req.body.rating,
      event: req.body.event,
      user: req.user._id
    };

    if (req.body.parentComment) {
      commentData.parentComment = req.body.parentComment;
    }

    const comment = await Comment.create(commentData);
    await comment.populate('user', 'username profile.firstName profile.lastName profile.avatar');

    // Add to parent replies array
    if (req.body.parentComment) {
      await Comment.findByIdAndUpdate(req.body.parentComment, { $push: { replies: comment._id } });
    }

    res.status(201).json({
      message: 'Comment created successfully',
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error while creating comment' });
  }
});

// @route   GET /api/comments/event/:eventId
// @desc    Get all comments for an event
// @access  Private
router.get('/event/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const comments = await Comment.find({ 
      event: req.params.eventId,
      parentComment: null 
    })
      .populate('user', 'username profile.firstName profile.lastName profile.avatar')
      .populate({
        path: 'replies',
        populate: {
          path: 'user',
          select: 'username profile.firstName profile.lastName profile.avatar'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch (error) {
    console.error('Fetch comments error:', error);
    res.status(500).json({ message: 'Server error while fetching comments' });
  }
});

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private
router.put('/:id', [
  body('content').notEmpty().withMessage('Comment content is required'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    comment.content = req.body.content;
    if (req.body.rating) comment.rating = req.body.rating;
    comment.isEdited = true;
    await comment.save();

    res.json({
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error while updating comment' });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();

    res.json({
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error while deleting comment' });
  }
});

// @route   POST /api/comments/:id/like
// @desc    Like a comment
// @access  Private
router.post('/:id/like', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const hasLiked = comment.likes.includes(req.user._id);
    
    if (hasLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      comment.likes.push(req.user._id);
    }

    await comment.save();

    res.json({
      message: hasLiked ? 'Comment unliked' : 'Comment liked',
      likes: comment.likes.length
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ message: 'Server error while liking comment' });
  }
});

export default router;