import jwt from 'jsonwebtoken';

export function signAccessToken(payload) {
  if (!payload) throw new Error('Payload is required');
  if (!process.env.JWT_ACCESS_SECRET) throw new Error('JWT_ACCESS_SECRET is not configured');

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'
  });
}

export function signRefreshToken(payload) {
  if (!payload) throw new Error('Payload is required');
  if (!process.env.JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET is not configured');

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
  });
}

export function verifyAccess(token) {
  if (!token) throw new Error('Token is required');
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    throw new Error(`Access token verification failed: ${error.message}`);
  }
}

export function verifyRefresh(token) {
  if (!token) throw new Error('Token is required');
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error(`Refresh token verification failed: ${error.message}`);
  }
}
