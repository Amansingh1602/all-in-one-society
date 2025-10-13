require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdmin() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/society_m';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@society.com' });
        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit(0);
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@society.com',
            password: hashedPassword,
            role: 'admin',
            block: 'A',
            flat: '101'
        });

        console.log('Admin user created successfully');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        mongoose.connection.close();
    }
}

createAdmin();
