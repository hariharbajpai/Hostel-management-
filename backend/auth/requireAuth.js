import { verifyAccess } from './jwt.js';

export default function requireAuth(req, res, next) {
  try {
    // Extract token from Authorization header or cookies
    const auth = req.headers.authorization;
    let token = null;

    if (auth && auth.startsWith('Bearer ')) {
      token = auth.slice(7);
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // Check for token presence
    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No authentication token provided' 
      });
    }

    // Verify and decode token
    const decoded = verifyAccess(token);
    
    // Attach user data to request
    req.user = decoded;
    
    next();
  } catch (error) {
    // Provide more specific error message
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: error.message || 'Invalid authentication token'
    });
  }
}
