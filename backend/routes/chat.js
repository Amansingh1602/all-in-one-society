const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const LostFound = require('../models/LostFound');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get chats for a lost/found item
router.get('/item/:itemId', auth, async (req, res) => {
  try {
    // First find the lost/found item to check ownership
    const item = await LostFound.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Find chats for this item where user is either a participant or the item owner
    let chat = await Chat.findOne({
      itemId: req.params.itemId,
      $or: [
        { participants: req.userId },
        { $and: [
          { 'itemId': req.params.itemId },
          { $expr: { $eq: [String(item.user), String(req.userId)] } }
        ]}
      ]
    }).populate('messages.sender', 'name');

    if (!chat) {
      // Create new chat with both users
      chat = await Chat.create({
        itemId: req.params.itemId,
        participants: [req.userId, item.user],
        messages: []
      });
    }

    res.json(chat);
  } catch (err) {
    console.error('Get chats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a message
router.post('/item/:itemId/message', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const item = await LostFound.findById(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Find chats for this item where user is either a participant or the item owner
    let chat = await Chat.findOne({
      itemId: req.params.itemId,
      $or: [
        { participants: req.userId },
        { $and: [
          { 'itemId': req.params.itemId },
          { $expr: { $eq: [String(item.user), String(req.userId)] } }
        ]}
      ]
    });

    if (!chat) {
      chat = await Chat.create({
        itemId: req.params.itemId,
        participants: [req.userId, item.user],
        messages: []
      });
    }

    chat.messages.push({
      sender: req.userId,
      content
    });

    await chat.save();
    
    // Populate the sender info for the new message
    const populatedChat = await Chat.findById(chat._id)
      .populate('messages.sender', 'name');
    
    res.json(populatedChat);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
