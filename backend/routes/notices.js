const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const notices = await Notice.find({
    $or: [
      { recipient: { $exists: false } },
      { recipient: null },
      { recipient: req.userId }
    ]
  }).populate('author', 'name email')
    .sort({ createdAt: -1 }); // Sort by creation time, most recent first
  res.json(notices);
});

router.post('/', auth, async (req, res) => {
  const data = req.body;
  data.author = req.userId;
  try {
    const notice = await Notice.create(data);
    res.json(notice);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Delete notice (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    res.json({ message: 'Notice deleted successfully' });
  } catch (err) {
    console.error('Delete notice error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
