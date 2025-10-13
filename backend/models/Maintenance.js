const mongoose = require('mongoose');

const MaintenanceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['maintenance', 'complaint'], required: true },
  category: { 
    type: String, 
    enum: [
      'plumbing',
      'electrical',
      'housekeeping',
      'security',
      'elevator',
      'parking',
      'gym',
      'swimming_pool',
      'common_area',
      'other'
    ], 
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'resolved', 'cancelled'],
    default: 'pending'
  },
  location: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminComments: String,
  resolvedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Maintenance', MaintenanceSchema);
