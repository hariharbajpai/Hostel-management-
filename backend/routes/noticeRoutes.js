import { Router } from 'express';
import { requireAuth } from '../middleware/index.js';
import { isAdmin, isStudent } from '../middleware/roleCheck.js';
import {
  createNotice,
  getNotices,
  getAllNotices,
  getNotice,
  updateNotice,
  togglePublishNotice,
  addComment,
  likeNotice,
  getNoticeStats,
  deleteNotice
} from '../controllers/noticeController.js';

const r = Router();

// Public/Student routes - View published notices
r.get('/', requireAuth, getNotices); // Students see filtered notices, admins see all
r.get('/:id', requireAuth, getNotice);
r.post('/:id/comments', requireAuth, addComment);
r.post('/:id/like', requireAuth, likeNotice);

// Admin routes - Full notice management
r.post('/admin/create', requireAuth, isAdmin, createNotice);
r.get('/admin/all', requireAuth, isAdmin, getAllNotices); // Get all notices including unpublished
r.put('/admin/:id', requireAuth, isAdmin, updateNotice);
r.post('/admin/:id/toggle-publish', requireAuth, isAdmin, togglePublishNotice);
r.get('/admin/stats', requireAuth, isAdmin, getNoticeStats);
r.delete('/admin/:id', requireAuth, isAdmin, deleteNotice);

export default r;