# VitStay - Complete Setup Guide

## 🎯 Project Overview

**VitStay** is a modern hostel management system for VIT Bhopal with:
- ✨ **Black & White Theme** with stunning 3D animations
- 🔐 **Google OAuth** authentication (@vitbhopal.ac.in only)
- 👥 **Role-based access** (Students & Admins)
- 📱 **Fully responsive** design
- ⚡ **Real-time updates** with toast notifications

---

## 📁 Project Structure

```
Hostel-management-/
├── backend/                 # Node.js + Express + MongoDB
│   ├── auth/               # Google OAuth & JWT
│   ├── controllers/        # Business logic
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Auth & role guards
│   └── index.js           # Entry point
│
└── frontend/               # React + Vite + Tailwind
    ├── src/
    │   ├── components/    # Navbar, Layout, ProtectedRoute
    │   ├── pages/        
    │   │   ├── student/  # Dashboard, Preferences, Profile
    │   │   └── admin/    # Dashboard, Applications, Swaps, Rooms
    │   ├── ui/           # Button, Input, Card, Modal, etc.
    │   ├── services/     # API integration (auth, hostel)
    │   ├── store/        # Zustand state management
    │   ├── lib/          # Axios instance
    │   └── App.jsx       # Main app with routing
    └── package.json
```

---

## 🚀 Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create `backend/.env`:

```env
# Server
PORT=8080
NODE_ENV=development

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id

# Domain
ALLOWED_STUDENT_DOMAIN=vitbhopal.ac.in

# Cookies
COOKIE_SECURE=false
COOKIE_SAME_SITE=Lax
COOKIE_DOMAIN=localhost
```

### 3. Start Backend

```bash
npm start
```

Backend runs on **http://localhost:8080**

---

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 3. Start Frontend

```bash
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## 🔑 Google OAuth Setup

### 1. Go to Google Cloud Console
https://console.cloud.google.com/

### 2. Create a New Project
- Name: VitStay

### 3. Enable Google+ API
- APIs & Services → Enable APIs → Google+ API → Enable

### 4. Create OAuth 2.0 Credentials
- Credentials → Create Credentials → OAuth 2.0 Client ID
- Application Type: Web Application
- Name: VitStay Web Client

### 5. Configure Authorized Origins
```
http://localhost:5173
http://localhost:8080
```

### 6. Configure Redirect URIs
```
http://localhost:5173
http://localhost:5173/login
```

### 7. Copy Client ID
- Use this in both backend and frontend `.env` files

---

## 📊 Database Models

### User
- googleId, email, name, role (admin/student), avatar

### StudentProfile
- foodPreference, preferredSeater, preferredAC
- preferredHostels, preferredBlock, amenities
- assignedRoom, status

### Room
- hostelNumber (1-8), hostelName, blockType
- seater, ac, amenities, occupants[], capacity

### SwapRequest
- fromUser, toUser, status, reason, seater, ac

### ChangeApplication
- user, name, registrationNumber, reason, type
- desiredSeater, desiredAC, desiredHostel, status

---

## 🛣️ API Endpoints

### Authentication
```
POST   /api/auth/google      - Google OAuth login
POST   /api/auth/refresh     - Refresh access token
POST   /api/auth/logout      - Logout
```

### Student Endpoints (Requires Auth + Student Role)
```
POST   /api/hostel/student/preferences   - Set preferences
POST   /api/hostel/student/assign        - Auto-assign room
GET    /api/hostel/student/profile       - Get profile
POST   /api/hostel/student/swap          - Request swap
POST   /api/hostel/student/change        - Apply for change
```

### Admin Endpoints (Requires Auth + Admin Role)
```
GET    /api/hostel/admin/applications           - List applications
POST   /api/hostel/admin/applications/:id/decide - Approve/reject
GET    /api/hostel/admin/swaps                  - List swaps
POST   /api/hostel/admin/swaps/:id/decide       - Approve/reject swap
POST   /api/hostel/admin/rooms/upsert           - Create/update room
POST   /api/hostel/admin/assign/batch           - Batch auto-assign
```

### Public
```
GET    /api/hostel/rooms/availability    - List available rooms
GET    /api/health                       - Health check
```

---

## 👥 User Roles

### Admin Emails (Configured in `backend/auth/adminList.js`)
```javascript
export const ADMIN_EMAILS = [
  'warden@vitbhopal.ac.in',
  'superintendent@vitbhopal.ac.in'
];
```

### Student
- Any @vitbhopal.ac.in email not in admin list

---

## 🎨 Frontend Features

### Pages

**Student:**
- `/student/dashboard` - Overview with stats
- `/student/preferences` - Set room preferences
- `/student/profile` - View profile & assigned room

**Admin:**
- `/admin/dashboard` - Statistics & quick actions
- `/admin/applications` - Manage change applications
- `/admin/swaps` - Manage swap requests
- `/admin/rooms` - Room inventory management

### UI Components

All in `src/ui/`:
- **Button** - Multiple variants (primary, secondary, outline, ghost, danger)
- **Input** - Text input with label and error states
- **Select** - Dropdown with options
- **Card** - Hover effects and 3D animations
- **Modal** - Animated modal dialogs
- **Badge** - Status badges (success, warning, danger, info)
- **Loader** - Loading spinners

### Key Features
✅ Google OAuth integration
✅ JWT token management with auto-refresh
✅ Protected routes with role-based access
✅ Responsive navbar with mobile menu
✅ Toast notifications
✅ Framer Motion 3D animations
✅ Black & white theme
✅ Form validations
✅ Error handling

---

## 🔄 Workflow

### Student Flow
1. Login with Google (@vitbhopal.ac.in)
2. Set preferences (food, seater, AC, hostel, amenities)
3. Request room assignment (auto-assigns based on preferences)
4. View assigned room details
5. Request swaps or changes if needed

### Admin Flow
1. Login with Google (admin email)
2. View dashboard with statistics
3. Review and approve/reject applications
4. Review and approve/reject swap requests
5. Manage room inventory
6. Batch auto-assign pending students

---

## 🎯 Testing

### Test Student Login
- Use any @vitbhopal.ac.in email (not in admin list)

### Test Admin Login
- Use warden@vitbhopal.ac.in or superintendent@vitbhopal.ac.in

### API Testing
```bash
# Health check
curl http://localhost:8080/api/health

# Get rooms availability (public)
curl http://localhost:8080/api/hostel/rooms/availability
```

---

## 🐛 Troubleshooting

### Google OAuth Not Working
- Check if Google Client ID is correct in both `.env` files
- Ensure redirect URIs are configured in Google Console
- Clear browser cache and cookies

### Backend Connection Failed
- Ensure MongoDB is running and connection string is correct
- Check if PORT 8080 is not in use
- Verify all environment variables are set

### Frontend Not Loading
- Run `npm install` in frontend directory
- Check if API_URL in `.env` is correct
- Clear browser cache
- Check browser console for errors

### CORS Errors
- Backend allows localhost origins by default
- Check `backend/index.js` CORS configuration

---

## 📦 Deployment

### Backend (Render/Railway)
1. Push code to GitHub
2. Connect repository
3. Set environment variables
4. Deploy

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variables
5. Deploy

---

## 🎉 You're All Set!

Your **VitStay** hostel management system is ready! 

- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- API Docs: http://localhost:8080/api/health

For issues or questions, check the individual README files in `backend/` and `frontend/` directories.
