import User from '../models/User.js';
import { ADMIN_EMAILS } from '../auth/adminList.js';
import { verifyIdToken } from '../auth/googleVerify.js';
import { signAccessToken, signRefreshToken, verifyRefresh } from '../auth/jwt.js';

const cookieOpts = (maxAgeMs) => ({
  httpOnly: true,
  secure: String(process.env.COOKIE_SECURE) === 'true',
  sameSite: process.env.COOKIE_SAME_SITE || 'Lax',
  domain: process.env.COOKIE_DOMAIN || 'localhost',
  maxAge: maxAgeMs
});

const ERROR_MESSAGES = {
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized access'
};

// Decide role from email
const decideRole = (email) => {
  const lower = email.toLowerCase();
  if (ADMIN_EMAILS.includes(lower)) return 'admin';
  const domain = lower.split('@')[1];
  if (domain === (process.env.ALLOWED_STUDENT_DOMAIN || 'vitbhopal.ac.in')) return 'student';
  return null; // not allowed
};

// ---------- Google OAuth Login (Only Authentication Method) ----------
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'idToken required' });
    }
    
    const g = await verifyIdToken(idToken);
    if (!g.emailVerified) {
      return res.status(401).json({ error: 'Email not verified' });
    }
    
    // Check if email is from allowed domain
    const domain = g.email.toLowerCase().split('@')[1];
    if (domain !== (process.env.ALLOWED_STUDENT_DOMAIN || 'vitbhopal.ac.in')) {
      return res.status(403).json({ error: 'Only @vitbhopal.ac.in emails are allowed' });
    }
    
    // Determine role based on email
    const role = decideRole(g.email.toLowerCase());
    if (!role) {
      return res.status(403).json({ error: 'Email not authorized' });
    }
    
    let user = await User.findOne({ email: g.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        googleId: g.googleId,
        email: g.email.toLowerCase(),
        name: g.name,
        avatar: g.picture,
        role: role
      });
    } else {
      // Update role based on current admin list
      user.role = role;
      user.googleId = g.googleId;
      user.name = g.name;
      user.avatar = g.picture;
      await user.save();
    }
    
    const payload = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: payload.id });
    
    return res
      .cookie('accessToken', accessToken, cookieOpts(15 * 60 * 1000))
      .cookie('refreshToken', refreshToken, cookieOpts(7 * 24 * 60 * 60 * 1000))
      .json({ user: payload, accessToken, refreshToken });
      
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ---------- REMOVED: All Email/Password Authentication ----------
// Both students and admins can ONLY login via Google OAuth with @vitbhopal.ac.in email
// Use /api/auth/google endpoint for all users

// ---------- Refresh ----------
export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    const { id } = verifyRefresh(token);
    const user = await User.findById(id);
    if (!user) return res.status(401).json({ error: 'Invalid session' });

    const payload = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
    const accessToken = signAccessToken(payload);

    return res
      .cookie('accessToken', accessToken, cookieOpts(15 * 60 * 1000))
      .json({ accessToken });
  } catch {
    return res.status(401).json({ error: ERROR_MESSAGES.INVALID_TOKEN });
  }
};

// ---------- Logout ----------
export const logout = async (_req, res) => {
  const common = {
    domain: process.env.COOKIE_DOMAIN || 'localhost',
    sameSite: process.env.COOKIE_SAME_SITE || 'Lax',
    secure: String(process.env.COOKIE_SECURE) === 'true',
    httpOnly: true
  };
  res.clearCookie('accessToken', common);
  res.clearCookie('refreshToken', common);
  return res.json({ ok: true });
};


