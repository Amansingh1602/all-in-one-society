# All-in-One Society Management System

A comprehensive society management application built with React and Node.js, featuring resident directory, notices, polls, bookings, lost & found, and maintenance requests.

## Features

- 🏠 **Resident Directory** - View and search resident information
- 📢 **Notices & Announcements** - Create and view society notices with polls
- 📅 **Facility Bookings** - Book common facilities and manage reservations
- 🔍 **Lost & Found** - Post and search for lost/found items with image uploads
- 🔧 **Maintenance Requests** - Submit and track maintenance issues
- 👥 **User Authentication** - Secure login system with admin/resident roles
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios for API calls
- React Toastify for notifications

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing
- Multer for file uploads
- CORS enabled

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/all-in-one-society.git
cd all-in-one-society
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Set up environment variables

Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/society_m
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

5. Start the backend server
```bash
cd backend
npm start
```

6. Start the frontend development server
```bash
cd frontend
npm run dev
```

The application will be running at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Admin Account

- Email: admin@society.com
- Password: admin123

## Deployment

### Vercel (Frontend)
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set the build settings:
   - Framework Preset: Vite
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: dist

### Backend Deployment
Deploy the backend to platforms like:
- Railway
- Heroku
- DigitalOcean App Platform
- AWS Elastic Beanstalk

Make sure to:
1. Set up MongoDB Atlas for database
2. Update environment variables
3. Update frontend API URLs to point to deployed backend

## Project Structure

```
society_m/
├── frontend/          # React frontend
│   ├── public/       # Static assets
│   ├── src/          # Source code
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── utils/        # Utility functions
│   │   └── App.jsx       # Main app component
│   └── package.json
├── backend/           # Node.js backend
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API routes
│   ├── middleware/   # Express middleware
│   ├── uploads/      # File uploads directory
│   └── server.js     # Express server
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Notices
- `GET /api/notices` - Get all notices
- `POST /api/notices` - Create notice (Admin only)

### Residents
- `GET /api/residents` - Get all residents

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking

### Lost & Found
- `GET /api/lostfound` - Get lost & found items
- `POST /api/lostfound` - Post new item

### Maintenance
- `GET /api/maintenance` - Get maintenance requests
- `POST /api/maintenance` - Create maintenance request

### Polls
- `GET /api/polls/notice/:noticeId` - Get poll for notice
- `POST /api/polls/:pollId/vote` - Vote on poll

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email your-email@example.com or create an issue in the GitHub repository.