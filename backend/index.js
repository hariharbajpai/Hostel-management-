import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from './db/index.js';
import authRoutes from './routes/authRoutes.js';
import hostelRoutes from './routes/hostelRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import { notFound, errorHandler } from './middleware/index.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
  origin: ['http://localhost:5173'], 
  credentials: true 
}));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notices', noticeRoutes);

// 404 + error
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

try {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Auth API running on :${PORT}`);
    console.log(`📊 Health check available at: http://localhost:${PORT}/api/health`);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  console.log('\n💡 Troubleshooting tips:');
  console.log('1. Check if MongoDB is running locally (mongod)');
  console.log('2. Verify your MongoDB Atlas connection string');
  console.log('3. Check your internet connection for Atlas');
  console.log('4. Ensure your IP is whitelisted in MongoDB Atlas');
  process.exit(1);
}
