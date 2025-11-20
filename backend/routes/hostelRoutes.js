import { Router } from 'express';
import { requireAuth, requireRole, loginLimiter } from '../middleware/index.js';
import { isAdmin, isStudent } from '../middleware/roleCheck.js';
import {
  setPreferences,
  autoAssignRoom,
  getProfile,
  requestSwap,
  applyChange,
  listApplications,
  decideApplication,
  listSwapRequests,
  decideSwap,
  upsertRoom,
  listAvailability,
  batchAutoAssign,
  bulkAddRooms,
  getHostelNames,
  deletePreferences
} from '../controllers/hostelController.js';

const r = Router();

// Public
r.get('/rooms/availability', listAvailability);
r.get('/rooms/hostel-names', getHostelNames);

// Student routes
r.post('/student/preferences', requireAuth, isStudent, setPreferences);
r.delete('/student/preferences', requireAuth, isStudent, deletePreferences);
// r.post('/student/assign', requireAuth, isStudent, autoAssignRoom); // Removed as per user request
r.get('/student/profile', requireAuth, isStudent, getProfile);
r.post('/student/swap', requireAuth, isStudent, requestSwap);
r.post('/student/change', requireAuth, isStudent, applyChange);

// Admin routes
r.get('/admin/applications', requireAuth, isAdmin, listApplications);
r.post('/admin/applications/:id/decide', requireAuth, isAdmin, decideApplication);
r.get('/admin/swaps', requireAuth, isAdmin, listSwapRequests);
r.post('/admin/swaps/:id/decide', requireAuth, isAdmin, decideSwap);
r.post('/admin/rooms/upsert', requireAuth, isAdmin, upsertRoom);
r.post('/admin/rooms/bulk', requireAuth, isAdmin, bulkAddRooms);
r.post('/admin/assign/batch', requireAuth, isAdmin, batchAutoAssign);

export default r;