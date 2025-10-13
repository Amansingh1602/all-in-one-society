const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const LostFound = require('../models/LostFound');
const auth = require('../middleware/auth');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/lostfound')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file) {
      cb(null, true);
    } else if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed!'), false);
    } else {
      cb(null, true);
    }
  }
});

// Get all items
router.get('/', async (req, res) => {
  try {
    const items = await LostFound.find()
      .populate('user', 'name email')
      .sort('-createdAt');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new item
router.post('/', auth, async (req, res) => {
  try {
    // Ensure the uploads directory exists before handling file upload
    await fs.mkdir('uploads/lostfound', { recursive: true });

    // Handle file upload after directory is created
    upload.single('image')(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ 
          error: err instanceof multer.MulterError 
            ? 'File upload error: ' + err.message
            : err.message || 'File upload failed'
        });
      }

      try {
        // Validate required fields
        if (!req.body.title || !req.body.type || !req.body.date || !req.body.location || !req.body.contact) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const data = {
          ...req.body,
          user: req.userId
        };
        
        if (req.file) {
          data.image = `/uploads/lostfound/${req.file.filename}`;
        }

        const item = await LostFound.create(data);
        const populatedItem = await LostFound.findById(item._id).populate('user', 'name email');
        res.json(populatedItem);
      } catch (createErr) {
        console.error('Create item error:', createErr);
        res.status(400).json({ error: createErr.message || 'Invalid data' });
      }
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update item status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    
    // Only the creator or admin can update status
    if (item.user.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    item.status = req.body.status;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete item (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Only admin can delete items
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can remove items' });
    }

    const item = await LostFound.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Delete associated image if exists
    if (item.image) {
      const imagePath = path.join(__dirname, '..', item.image);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.error('Error deleting image file:', err);
        // Continue with item deletion even if image deletion fails
      }
    }

    await item.deleteOne();
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
