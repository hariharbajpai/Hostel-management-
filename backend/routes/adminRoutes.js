import express from 'express';
import { addStudent, bulkAddStudents, getDashboardStats } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/index.js';

const router = express.Router();

// Protect all admin routes
router.use(requireAuth, requireRole('admin'));

router.post('/add-student', addStudent);
router.post('/bulk-add-students', bulkAddStudents);
router.get('/stats', getDashboardStats);

export default router;
