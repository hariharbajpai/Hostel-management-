import User from '../../models/User.js';
import { ADMIN_EMAILS } from '../auth/adminList.js';
import { verifyIdToken } from '../auth/googleVerify.js';
import { signAccessToken, signRefreshToken, verifyRefresh } from '../auth/jwt.js';
import bcrypt from 'bcryptjs';

const cookieOpts = (maxAgeMs) => ({
  httpOnly: true,
  secure: String(process.env.COOKIE_SECURE) === 'true',
  sameSite: process.env.COOKIE_SAME_SITE || 'Lax',
  domain: process.env.COOKIE_DOMAIN || 'localhost',
  maxAge: maxAgeMs
});

// Decide role from email
const decideRole = (email) => {
  const lower = email.toLowerCase();
  if (ADMIN_EMAILS.includes(lower)) return 'admin';
  const domain = lower.split('@')[1];
  if (domain === (process.env.ALLOWED_STUDENT_DOMAIN || 'vitbhopal.ac.in')) return 'student';
  return null; // not allowed
};

// ---------- Google Login ----------
export const googleLogin = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'idToken required' });

  const g = await verifyIdToken(idToken);
  if (!g.emailVerified) return res.status(401).json({ error: 'Email not verified' });

  const role = decideRole(g.email);
  if (!role) return res.status(403).json({ error: 'Only allowlisted admins or @vitbhopal.ac.in students' });

  let user = await User.findOne({ email: g.email.toLowerCase() });
  if (!user) {
    user = await User.create({
      googleId: g.googleId,
      email: g.email.toLowerCase(),
      name: g.name,
      avatar: g.picture,
      role
    });
  } else if (user.role !== role) {
    user.role = role;
    await user.save();
  }

  const payload = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ id: payload.id });

  return res
    .cookie('accessToken', accessToken, cookieOpts(15 * 60 * 1000))
    .cookie('refreshToken', refreshToken, cookieOpts(7 * 24 * 60 * 60 * 1000))
    .json({ user: payload, accessToken, refreshToken });
};

// ---------- Email/Password Register (students + allowlisted admins) ----------
export const register = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });

  const role = decideRole(email);
  if (!role) return res.status(403).json({ error: 'Only allowlisted admins or @vitbhopal.ac.in students' });

  const lower = email.toLowerCase();
  const exists = await User.findOne({ email: lower });
  if (exists) return res.status(409).json({ error: 'Email already registered' });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const user = await User.create({ email: lower, name, passwordHash, role });

  const payload = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ id: payload.id });

  return res
    .cookie('accessToken', accessToken, cookieOpts(15 * 60 * 1000))
    .cookie('refreshToken', refreshToken, cookieOpts(7 * 24 * 60 * 60 * 1000))
    .status(201)
    .json({ user: payload, accessToken, refreshToken });
};

// ---------- Email/Password Login ----------
export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  // enforce role policy every login
  const role = decideRole(user.email);
  if (!role) return res.status(403).json({ error: 'Policy restriction' });
  if (user.role !== role) { user.role = role; await user.save(); }

  const payload = { id: user._id.toString(), role: user.role, email: user.email, name: user.name };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ id: payload.id });

  return res
    .cookie('accessToken', accessToken, cookieOpts(15 * 60 * 1000))
    .cookie('refreshToken', refreshToken, cookieOpts(7 * 24 * 60 * 60 * 1000))
    .json({ user: payload, accessToken, refreshToken });
};

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
    return res.status(401).json({ error: 'Invalid refresh token' });
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

// ---------- Me ----------
export const me = async (req, res) => {
  return res.json({ user: req.user });
};
