require('dotenv').config();
require('express-async-errors');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
// CORS configuration for development and production
const allowedOrigins = [
  'http://localhost:3000', 
  'http://localhost:3001',
  'https://all-in-one-society-ryxf.vercel.app/',
  'https://all-in-one-society-ryxf-aman-singhs-projects-12a28ec0.vercel.app/' // Replace with your actual Vercel URL
  // Set this in Render environment variables
].filter(Boolean);

app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Add CORS headers for image requests
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/society_m';
mongoose.set('strictQuery', false);
mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');
    // Create default admin user if not exists
    const User = require('./models/User');
    User.findOne({ email: 'admin@society.com' }).then(admin => {
      if (!admin) {
        bcrypt.hash('admin123', 10).then(hashedPassword => {
          User.create({
            name: 'Admin User',
            email: 'admin@society.com',
            password: hashedPassword,
            role: 'admin',
            block: 'A',
            flat: '101'
          }).then(() => console.log('Default admin user created'));
        });
      }
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Ensure uploads directory exists
const fs = require('fs').promises;
fs.mkdir('uploads/lostfound', { recursive: true }).catch(err => {
  console.error('Error creating uploads directory:', err);
});

// Routes (basic)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/residents', require('./routes/residents'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/lostfound', require('./routes/lostfound'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/polls', require('./routes/polls'));
app.use('/api/maintenance', require('./routes/maintenance'));

app.get('/', (req, res) => res.send({ ok: true, message: 'Society Management API' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error' });
});

// Add a test route for debugging
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server listening on http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Graceful shutdown...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Add error handling for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.log('Uncaught Exception:', error);
});
