import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './db/index.js';
import authRoutes from './routes/authRoutes.js';
import { notFound, errorHandler } from './middleware/index.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: [/localhost:\d+$/, /127\.0\.0\.1:\d+$/], credentials: true }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);

// 404 + error
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
await connectDB();
app.listen(PORT, () => console.log(`Auth API running on :${PORT}`));
