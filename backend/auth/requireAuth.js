import { verifyAccess } from './jwt.js';

export default function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization;
    let token = null;

    if (auth && auth.startsWith('Bearer ')) token = auth.slice(7);
    if (!token && req.cookies?.accessToken) token = req.cookies.accessToken;

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = verifyAccess(token);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
