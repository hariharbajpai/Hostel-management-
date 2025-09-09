import User from '../models/User.js';
import { ADMIN_EMAILS } from '../auth/adminList.js';
import { verifyIdToken } from '../auth/googleVerify.js';
import { signAccessToken, signRefreshToken, verifyRefresh } from '../auth/jwt.js';
import bcrypt from 'bcryptjs';
import { isValidEmail, isStrongPassword } from '../utils/validation.js';

const cookieOpts = (maxAgeMs) => ({
  httpOnly: true,
  secure: String(process.env.COOKIE_SECURE) === 'true',
  sameSite: process.env.COOKIE_SAME_SITE || 'Lax',
  domain: process.env.COOKIE_DOMAIN || 'localhost',
  maxAge: maxAgeMs
});

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_IN_USE: 'Email is already registered',
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

// ---------- Student Google Login (Only Google OAuth) ----------
export const studentGoogleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'idToken required' });
    }
    
    const g = await verifyIdToken(idToken);
    if (!g.emailVerified) {
      return res.status(401).json({ error: 'Email not verified' });
    }
    
    // Strict check: Only @vitbhopal.ac.in emails allowed for students
    const domain = g.email.toLowerCase().split('@')[1];
    if (domain !== (process.env.ALLOWED_STUDENT_DOMAIN || 'vitbhopal.ac.in')) {
      return res.status(403).json({ error: 'Only @vitbhopal.ac.in students are allowed' });
    }
    
    let user = await User.findOne({ email: g.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        googleId: g.googleId,
        email: g.email.toLowerCase(),
        name: g.name,
        avatar: g.picture,
        role: 'student'
      });
    } else {
      // Ensure role is always student for @vitbhopal.ac.in
      user.role = 'student';
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
    console.error('Student Google login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ---------- REMOVED: Student Registration via Email/Password ----------
// Students can ONLY login via Google OAuth with @vitbhopal.ac.in email

// ---------- Admin Registration ----------
export const adminSignup = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    
    // Validate required fields
    if (!name || !phone || !email || !password) {
      return res.status(400).json({ error: 'Name, phone, email, and password are required' });
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate password strength
    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' });
    }
    
    // Check if email is in authorized admin list
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      return res.status(403).json({ error: 'Email not authorized for admin registration' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Admin with this email already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Create admin user
    const user = await User.create({
      email: email.toLowerCase(),
      name,
      phone,
      role: 'admin',
      passwordHash
    });
    
    // Generate tokens
    const payload = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: payload.id });
    
    return res
      .status(201)
      .cookie('accessToken', accessToken, cookieOpts(15 * 60 * 1000))
      .cookie('refreshToken', refreshToken, cookieOpts(7 * 24 * 60 * 60 * 1000))
      .json({ user: payload, accessToken, refreshToken });
      
  } catch (error) {
    console.error('Admin signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ---------- REMOVED: Email/Password Login ----------
// Students can ONLY login via Google OAuth

// ---------- Admin Login ----------
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Check if email is in admin list
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      return res.status(403).json({ error: 'Not authorized as admin' });
    }
    
    // Find user and verify password
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS });
    }
    
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: ERROR_MESSAGES.INVALID_CREDENTIALS });
    }
    
    // Ensure user role is admin (in case of role changes)
    if (user.role !== 'admin') {
      user.role = 'admin';
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
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ---------- REMOVED: Student Email/Password Login ----------
// Students can ONLY login via Google OAuth with @vitbhopal.ac.in email
// Use /api/auth/student/google endpoint instead

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


