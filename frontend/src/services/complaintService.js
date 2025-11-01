import api from '../lib/axios';

const complaintService = {
  // ===== STUDENT ENDPOINTS =====
  createComplaint: async (complaintData) => {
    const { data } = await api.post('/complaints', complaintData);
    return data;
  },

  getMyComplaints: async (filters = {}) => {
    const { data } = await api.get('/complaints', { params: filters });
    return data;
  },

  getComplaint: async (id) => {
    const { data } = await api.get(`/complaints/${id}`);
    return data;
  },

  addComment: async (id, content) => {
    const { data } = await api.post(`/complaints/${id}/comments`, { content });
    return data;
  },

  upvoteComplaint: async (id) => {
    const { data } = await api.post(`/complaints/${id}/upvote`);
    return data;
  },

  // ===== ADMIN ENDPOINTS =====
  getAllComplaints: async (filters = {}) => {
    const { data } = await api.get('/complaints/admin/all', { params: filters });
    return data;
  },

  updateComplaintStatus: async (id, statusData) => {
    const { data } = await api.put(`/complaints/${id}/status`, statusData);
    return data;
  },

  getComplaintStats: async () => {
    const { data } = await api.get('/complaints/admin/stats');
    return data;
  },

  deleteComplaint: async (id) => {
    const { data } = await api.delete(`/complaints/${id}`);
    return data;
  },
};

export default complaintService;