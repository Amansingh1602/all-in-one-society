const mongoose = require('mongoose');

const PollOptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const PollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [PollOptionSchema],
  endDate: { type: Date, required: true },
  notice: { type: mongoose.Schema.Types.ObjectId, ref: 'Notice', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Poll', PollSchema);
