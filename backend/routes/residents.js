const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// List residents (basic)
router.get('/', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// Get resident by id
router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

// Update own profile
router.put('/:id', auth, async (req, res) => {
  if (req.userId !== req.params.id && req.userRole !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const updates = req.body;
  delete updates.password;
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  res.json(user);
});

module.exports = router;
