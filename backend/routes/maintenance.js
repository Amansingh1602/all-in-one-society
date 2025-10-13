const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const auth = require('../middleware/auth');

// Get all maintenance requests
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    // If not admin, only show user's own requests
    if (req.userRole !== 'admin') {
      query.user = req.userId;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const requests = await Maintenance.find(query)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new maintenance request
router.post('/', auth, async (req, res) => {
  try {
    const request = await Maintenance.create({
      ...req.body,
      user: req.userId
    });
    const populatedRequest = await Maintenance.findById(request._id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');
    res.status(201).json(populatedRequest);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Invalid data' });
  }
});

// Update maintenance request status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can update request status' });
    }

    const { status, adminComments, assignedTo } = req.body;
    const updateData = { status };

    if (adminComments) {
      updateData.adminComments = adminComments;
    }

    if (assignedTo) {
      updateData.assignedTo = assignedTo;
    }

    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const request = await Maintenance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('user', 'name email')
    .populate('assignedTo', 'name email');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel maintenance request (user can cancel their own requests)
router.post('/:id/cancel', auth, async (req, res) => {
  try {
    const request = await Maintenance.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Only allow cancellation by the request owner or admin
    if (request.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to cancel this request' });
    }

    // Only allow cancellation of pending or in_progress requests
    if (!['pending', 'in_progress'].includes(request.status)) {
      return res.status(400).json({ error: `Cannot cancel a ${request.status} request` });
    }

    request.status = 'cancelled';
    await request.save();
    
    const populatedRequest = await Maintenance.findById(request._id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');
    res.json(populatedRequest);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get monthly statistics (admin only)
router.get('/stats/monthly', auth, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can view statistics' });
    }

    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const stats = await Maintenance.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            category: '$category',
            status: '$status'
          },
          count: { $sum: 1 },
          avgResolutionTime: {
            $avg: {
              $cond: [
                { $eq: ['$status', 'resolved'] },
                {
                  $divide: [
                    { $subtract: ['$resolvedAt', '$createdAt'] },
                    1000 * 60 * 60 // Convert to hours
                  ]
                },
                null
              ]
            }
          }
        }
      }
    ]);

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
