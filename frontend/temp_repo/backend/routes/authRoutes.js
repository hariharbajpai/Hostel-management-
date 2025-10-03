// backend/routes/authRoutes.js
import { Router } from 'express';
import {
  studentGoogleLogin,
  adminSignup,
  adminLogin,
  refresh,
  logout
} from '../controllers/authController.js';

// single middleware hub (auth, role, limiter, 404/error live here)
import { requireAuth, loginLimiter } from '../middleware/index.js';

const r = Router();

/**
 * Student auth - ONLY Google OAuth allowed
 * - Students MUST use @vitbhopal.ac.in email
 * - No email/password registration or login
 */
r.post('/student/google', studentGoogleLogin);

/**
 * Admin auth
 * - Admin signup with authorized emails only
 * - Admin login with email/password
 */
r.post('/admin/signup', loginLimiter, adminSignup);
r.post('/admin/login', loginLimiter, adminLogin);

/**
 * Session utils
 * - refresh is public (takes refreshToken from cookie/body)
 * - logout is protected
 */
r.post('/refresh', refresh);
r.post('/logout', requireAuth, logout);



export default r;
