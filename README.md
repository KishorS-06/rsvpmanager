# RSVP Manager - Complete MERN Stack Application

A full-stack event management application built with the MERN stack (MongoDB, Express, React, Node.js) with advanced features.

## 🚀 Features

### User Management
- User registration with email validation
- Secure login with JWT authentication
- User profiles with avatars and settings
- Theme switching (dark/light mode)
- Multi-language support

### Event Management
- Multi-step event creation wizard
- Event categories and tags
- Event cover images
- Event cloning and templates
- Calendar integration (Google Calendar, ICS export)
- Social sharing capabilities
- Event analytics and insights

### Guest Management
- Guest list management
- RSVP tracking with QR codes
- Check-in system
- Dietary restrictions tracking
- Capacity management
- Waitlist functionality

### Advanced Features
- Real-time notifications with Socket.io
- Email notifications
- Guest analytics and reporting
- Comment and review system
- Search and filtering
- Payment integration (Stripe)
- Automated reminder scheduling

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)

## 🛠️ Installation

### Quick Setup (Windows)
```bash
setup.bat
```

### Quick Setup (Mac/Linux)
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

#### 1. Clone the repository
```bash
git clone <your-repository-url>
cd rsvpmanager
```

#### 2. Install dependencies
```bash
npm run install:all
```

#### 3. Configure environment variables

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
```

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rsvpmanager
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### 4. Setup MongoDB
Start MongoDB locally or use MongoDB Atlas. Update `MONGODB_URI` in backend/.env.

## 🚀 Running the Application

### Quick Start
**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

### Manual Start
```bash
# Start both servers
npm run dev

# Or individually
npm run start:backend  # Port 5000
npm run start:frontend # Port 5173
```

### Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health

## 📁 Project Structure

```
rsvpmanager/
├── frontend/          # React application
│   ├── src/         # React source
│   ├── public/      # Static files
│   └── package.json # Frontend dependencies
├── backend/          # Node.js application
│   ├── config/      # Configuration
│   ├── middleware/  # Express middleware
│   ├── models/      # Mongoose models
│   ├── routes/      # Express routes
│   ├── uploads/     # Uploaded files
│   └── server.js    # Backend entry point
├── package.json     # Root dependencies and scripts
├── setup.bat/sh     # Setup scripts
├── start.bat/sh     # Startup scripts
└── README.md        # This file
```

## 🔐 API Endpoints

### Authentication
- `POST /api/signup` - Register user
- `POST /api/login` - Login user

### User Management
- `GET /api/users/profile` - Get profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/settings` - Update settings

### Events
- `POST /api/events` - Create event
- `GET /api/events` - Get user events
- `GET /api/events/:id` - Get single event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/clone` - Clone event
- `GET /api/events/:id/analytics` - Get analytics

### Guests
- `POST /api/guests` - Add guest
- `GET /api/guests/event/:eventId` - Get event guests
- `PUT /api/guests/:id/rsvp` - Update RSVP
- `PUT /api/guests/:id/checkin` - Check in guest

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

## 🔒 Security

- Password hashing with bcryptjs
- JWT token authentication
- Protected API routes
- Input validation
- CORS configuration

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist folder
```

### Backend (Heroku/Render)
Set environment variables and deploy.

## 📄 License

ISC License

---

**Built with ❤️ using the MERN stack**