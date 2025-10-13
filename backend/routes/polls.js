const express = require('express');
const router = express.Router();
const Poll = require('../models/Poll');
const Notice = require('../models/Notice');
const auth = require('../middleware/auth');

// Get poll for a notice
router.get('/notice/:noticeId', auth, async (req, res) => {
  try {
    const poll = await Poll.findOne({ notice: req.params.noticeId })
      .populate('options.votes', 'name email');
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new poll for a notice
router.post('/', auth, async (req, res) => {
  try {
    const { noticeId, question, options, endDate } = req.body;

    // Only admin can create polls
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can create polls' });
    }

    // Validate input
    if (!question || !options || !options.length || !endDate || !noticeId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create poll with empty votes arrays
    const pollOptions = options.map(opt => ({ text: opt, votes: [] }));
    const poll = await Poll.create({
      question,
      options: pollOptions,
      endDate: new Date(endDate),
      notice: noticeId
    });

    // Update notice to indicate it has a poll
    await Notice.findByIdAndUpdate(noticeId, { hasPoll: true });

    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Vote on a poll
router.post('/:id/vote', auth, async (req, res) => {
  try {
    const { optionId } = req.body;
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check if poll has ended
    if (new Date(poll.endDate) < new Date()) {
      return res.status(400).json({ error: 'Poll has ended' });
    }

    // Check if user has already voted
    const hasAlreadyVoted = poll.options.some(opt => 
      opt.votes.some(v => v.toString() === req.userId)
    );
    
    if (hasAlreadyVoted) {
      return res.status(400).json({ error: 'You have already voted in this poll' });
    }

    // Add new vote
    const option = poll.options.id(optionId);
    if (!option) {
      return res.status(404).json({ error: 'Option not found' });
    }
    option.votes.push(req.userId);

    await poll.save();
    const updatedPoll = await Poll.findById(req.params.id)
      .populate('options.votes', 'name email');
    res.json(updatedPoll);
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change vote on a poll (remove previous vote and add new one)
router.put('/:id/change-vote', auth, async (req, res) => {
  try {
    const { optionId } = req.body;
    const poll = await Poll.findById(req.params.id);
    
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check if poll has ended
    if (new Date(poll.endDate) < new Date()) {
      return res.status(400).json({ error: 'Poll has ended' });
    }

    // Remove user's previous vote if any
    poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(v => v.toString() !== req.userId);
    });

    // Add new vote
    const option = poll.options.id(optionId);
    if (!option) {
      return res.status(404).json({ error: 'Option not found' });
    }
    option.votes.push(req.userId);

    await poll.save();
    const updatedPoll = await Poll.findById(req.params.id)
      .populate('options.votes', 'name email');
    res.json(updatedPoll);
  } catch (err) {
    console.error('Change vote error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
