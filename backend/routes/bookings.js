const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// List bookings (optionally filter by status)
router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const bookings = await Booking.find(filter).populate('user', 'name email role').sort({ createdAt: -1 });
  res.json(bookings);
});

// List current user's bookings
router.get('/mine', auth, async (req, res) => {
  const bookings = await Booking.find({ user: req.userId }).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(bookings);
});

// Create booking (authenticated)
router.post('/', auth, async (req, res) => {
  const data = req.body;
  data.user = req.userId;
  try {
    const booking = await Booking.create(data);
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// Admin: update booking status (approve/reject)
router.patch('/:id/status', auth, async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { status } = req.body;
  if (!['pending', 'approved', 'rejected', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('user', 'name email');
    if (!booking) return res.status(404).json({ error: 'Not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin: delete booking
router.delete('/:id', auth, async (req, res) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Only administrators can delete bookings' });
  }

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await booking.deleteOne();
    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// User: cancel their booking
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'name email');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Only allow cancellation by the booking owner or admin
    if (booking.user._id.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }

    // Only allow cancellation of pending or approved bookings
    if (!['pending', 'approved'].includes(booking.status)) {
      return res.status(400).json({ error: `Cannot cancel a ${booking.status} booking` });
    }

    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
