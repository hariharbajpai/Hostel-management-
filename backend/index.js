import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './backend/db/index.js';
import authRoutes from './backend/routes/authRoutes.js';

const app = express();

// core middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [/localhost:\d+$/, /127\.0\.0\.1:\d+$/],
  credentials: true
}));

// health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// routes
app.use('/api/auth', authRoutes);

// start
const PORT = process.env.PORT || 8080;
await connectDB();
app.listen(PORT, () => console.log(`Auth API running on :${PORT}`));
