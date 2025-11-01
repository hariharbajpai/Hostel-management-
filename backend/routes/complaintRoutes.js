import { Router } from 'express';
import { requireAuth } from '../middleware/index.js';
import { isAdmin, isStudent } from '../middleware/roleCheck.js';
import {
  createComplaint,
  getComplaints,
  getComplaint,
  updateComplaintStatus,
  addComment,
  upvoteComplaint,
  getComplaintStats,
  deleteComplaint
} from '../controllers/complaintController.js';

const r = Router();

// Student routes - Create and manage their own complaints
r.post('/', requireAuth, isStudent, createComplaint);
r.get('/', requireAuth, getComplaints); // Both students and admins can access (filtered by role)
r.get('/:id', requireAuth, getComplaint);
r.post('/:id/comments', requireAuth, addComment);
r.post('/:id/upvote', requireAuth, isStudent, upvoteComplaint);

// Admin routes - Manage all complaints
r.get('/admin/all', requireAuth, isAdmin, getComplaints); // Explicit admin route for all complaints
r.put('/:id/status', requireAuth, isAdmin, updateComplaintStatus);
r.get('/admin/stats', requireAuth, isAdmin, getComplaintStats);
r.delete('/:id', requireAuth, isAdmin, deleteComplaint);

export default r;