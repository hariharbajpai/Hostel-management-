import { Router } from 'express';
import { googleLogin, register, login, refresh, logout, me } from '../controllers/authController.js';
import requireAuth from '../auth/requireAuth.js';

const r = Router();

r.post('/google', googleLogin);     // { idToken }
r.post('/register', register);      // { email, password, name }  (students + allowlisted admins)
r.post('/login', login);            // { email, password }

r.post('/refresh', refresh);
r.post('/logout', logout);
r.get('/me', requireAuth, me);

export default r;
