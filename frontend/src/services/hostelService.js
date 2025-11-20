import api from '../lib/axios';

const hostelService = {
  // ===== PUBLIC ENDPOINTS =====
  getRoomsAvailability: async (filters = {}) => {
    const { data } = await api.get('/hostel/rooms/availability', { params: filters });
    return data;
  },

  getHostelNames: async () => {
    const { data } = await api.get('/hostel/rooms/hostel-names');
    return data;
  },

  // ===== STUDENT ENDPOINTS =====
  setPreferences: async (preferences) => {
    const { data } = await api.post('/hostel/student/preferences', preferences);
    return data;
  },

  deletePreferences: async () => {
    const { data } = await api.delete('/hostel/student/preferences');
    return data;
  },

  autoAssignRoom: async () => {
    const { data } = await api.post('/hostel/student/assign');
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get('/hostel/student/profile');
    return data;
  },

  requestSwap: async (swapData) => {
    const { data } = await api.post('/hostel/student/swap', swapData);
    return data;
  },

  applyChange: async (changeData) => {
    const { data } = await api.post('/hostel/student/change', changeData);
    return data;
  },

  // ===== ADMIN ENDPOINTS =====
  listApplications: async () => {
    const { data } = await api.get('/hostel/admin/applications');
    return data;
  },

  decideApplication: async (id, decision, adminNote = '') => {
    const { data } = await api.post(`/hostel/admin/applications/${id}/decide`, {
      decision,
      adminNote,
    });
    return data;
  },

  listSwapRequests: async () => {
    const { data } = await api.get('/hostel/admin/swaps');
    return data;
  },

  decideSwap: async (id, decision) => {
    const { data } = await api.post(`/hostel/admin/swaps/${id}/decide`, {
      decision,
    });
    return data;
  },

  upsertRoom: async (roomData) => {
    const { data } = await api.post('/hostel/admin/rooms/upsert', roomData);
    return data;
  },

  bulkAddRooms: async (roomsList) => {
    const { data } = await api.post('/hostel/admin/rooms/bulk', { rooms: roomsList });
    return data;
  },

  batchAutoAssign: async () => {
    const { data } = await api.post('/hostel/admin/assign/batch');
    return data;
  },
};

export default hostelService;
