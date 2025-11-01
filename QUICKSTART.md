# VitStay - Quick Start

## 🚀 Get Started in 5 Minutes

### 1. Backend Setup
```bash
cd backend
npm install

# Create .env file
echo "PORT=8080
MONGODB_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_secret_1
JWT_REFRESH_SECRET=your_secret_2
GOOGLE_CLIENT_ID=your_google_client_id
ALLOWED_STUDENT_DOMAIN=vitbhopal.ac.in
COOKIE_SECURE=false
COOKIE_SAME_SITE=Lax
COOKIE_DOMAIN=localhost" > .env

# Start backend
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id" > .env

# Start frontend
npm run dev
```

### 3. Access Application
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:8080

### 4. Login
Use any **@vitbhopal.ac.in** email with Google OAuth

---

## 📋 Requirements

- **Node.js** 18+
- **MongoDB** (local or Atlas)
- **Google OAuth** credentials

---

## 🔑 Get Google OAuth Credentials

1. Visit: https://console.cloud.google.com/
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 Client ID
5. Add authorized origins:
   - http://localhost:5173
   - http://localhost:8080
6. Copy Client ID → Use in both `.env` files

---

## 🎯 What's Next?

Check **SETUP_GUIDE.md** for:
- Detailed configuration
- API documentation
- Troubleshooting
- Deployment guides

---

## 🎨 Features

✅ Google OAuth Login
✅ Student Dashboard
✅ Room Preferences
✅ Admin Dashboard
✅ Black & White Theme
✅ 3D Animations
✅ Mobile Responsive

Enjoy building with **VitStay**! 🏨
