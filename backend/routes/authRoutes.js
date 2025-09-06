// backend/routes/authRoutes.js
import { Router } from 'express';
import {
  googleLogin,
  adminLogin,
  studentLogin,
  register,
  refresh,
  logout,
  me
} from '../controllers/authController.js';

// single middleware hub (auth, role, limiter, 404/error live here)
import { requireAuth, loginLimiter } from '../middleware/index.js';
import { isAdmin, isStudent } from '../middleware/roleCheck.js';

const r = Router();

/**
 * Public: Google OAuth
 * - Role auto-decides via allowlist (@admin) / vitbhopal domain (@student)
 */
r.post('/google', googleLogin);

/**
 * Student auth
 */
r.post('/student/register', loginLimiter, register);
r.post('/student/login',    loginLimiter, studentLogin);

/**
 * Admin auth
 */
r.post('/admin/login', loginLimiter, adminLogin);

/**
 * Session utils
 * - refresh is public (takes refreshToken from cookie/body)
 * - logout is protected
 */
r.post('/refresh', refresh);
r.post('/logout', requireAuth, logout);

/**
 * Profile
 */
r.get('/me', requireAuth, me);

/**
 * Role-scoped demo routes (for quick verification)
 */
r.get('/admin/dashboard',   requireAuth, isAdmin,   (_req, res) => {
  res.json({ ok: true, message: 'Admin dashboard' });
});

r.get('/student/dashboard', requireAuth, isStudent, (_req, res) => {
  res.json({ ok: true, message: 'Student dashboard' });
});

export default r;
