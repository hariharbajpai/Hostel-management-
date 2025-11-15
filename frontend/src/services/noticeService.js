import api from '../lib/axios';

const noticeService = {
  // ===== PUBLIC/STUDENT ENDPOINTS =====
  getNotices: async (filters = {}) => {
    const { data } = await api.get('/notices', { params: filters });
    return data;
  },

  getNotice: async (id) => {
    const { data } = await api.get(`/notices/${id}`);
    return data;
  },

  addComment: async (id, content) => {
    const { data } = await api.post(`/notices/${id}/comments`, { content });
    return data;
  },

  likeNotice: async (id) => {
    const { data } = await api.post(`/notices/${id}/like`);
    return data;
  },

  // ===== ADMIN ENDPOINTS =====
  createNotice: async (noticeData) => {
    const { data } = await api.post('/notices/admin/create', noticeData);
    return data;
  },

  getAllNotices: async (filters = {}) => {
    const { data } = await api.get('/notices/admin/all', { params: filters });
    return data;
  },

  updateNotice: async (id, noticeData) => {
    const { data } = await api.put(`/notices/admin/${id}`, noticeData);
    return data;
  },

  togglePublishNotice: async (id) => {
    const { data } = await api.post(`/notices/admin/${id}/toggle-publish`);
    return data;
  },

  getNoticeStats: async () => {
    const { data } = await api.get('/notices/admin/stats');
    return data;
  },

  deleteNotice: async (id) => {
    const { data } = await api.delete(`/notices/admin/${id}`);
    return data;
  },
};

export default noticeService;