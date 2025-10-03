// Single middleware file: auth guard, role guard, login rate-limit, 404 + error handler
import rateLimit from 'express-rate-limit';
import { verifyAccess } from '../auth/jwt.js';

// ---- Helpers ----
function extractToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  if (req.cookies?.accessToken) return req.cookies.accessToken;
  return null;
}

// ---- Auth Guard ----
export function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided'
      });
    }
    const decoded = verifyAccess(token);
    req.user = decoded;
    // Add role to response header
    res.set('X-User-Role', decoded.role);
    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: err.message || 'Invalid authentication token'
    });
  }
}

// ---- Role Guard ----
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden', message: 'Insufficient role' });
    }
    next();
  };
}

// ---- Login Rate Limiter ----
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: 'TooManyAttempts',
    message: 'Too many login attempts. Try again after 15 minutes.'
  }
});

// ---- 404 ----
export function notFound(req, res, next) {
  res.status(404).json({
    error: 'NotFound',
    message: `Route ${req.originalUrl} not found`
  });
}

// ---- Central Error Handler ----
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    error: err.code || 'ServerError',
    message: err.message || 'Something went wrong'
  });
}
