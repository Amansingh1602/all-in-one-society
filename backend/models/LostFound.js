const mongoose = require('mongoose');

const LostFoundSchema = new mongoose.Schema({
  type: { type: String, enum: ['lost', 'found'], required: true },
  title: { type: String, required: true },
  description: String,
  location: String,
  date: { type: Date, required: true },
  image: String,
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contact: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LostFound', LostFoundSchema);
