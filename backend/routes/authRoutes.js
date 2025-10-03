// backend/routes/authRoutes.js
import { Router } from 'express';
import {
  googleLogin,
  refresh,
  logout
} from '../controllers/authController.js';

// single middleware hub (auth, role, limiter, 404/error live here)
import { requireAuth, loginLimiter } from '../middleware/index.js';

const r = Router();

/**
 * Google OAuth authentication - ONLY authentication method
 * - Both students and admins use Google OAuth with @vitbhopal.ac.in email
 * - Role is automatically determined based on email and admin list
 * - No email/password registration or login for anyone
 */
r.post('/google', googleLogin);

/**
 * Session utils
 * - refresh is public (takes refreshToken from cookie/body)
 * - logout is protected
 */
r.post('/refresh', refresh);
r.post('/logout', requireAuth, logout);



export default r;
