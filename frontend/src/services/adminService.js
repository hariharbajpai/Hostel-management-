import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin';

const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken'); // Fallback if cookies fail, but usually cookies are used
    // Actually, the backend uses cookies, but axios needs `withCredentials: true`.
    // If we are using Bearer token in header as backup (middleware supports it), we can add it.
    // The middleware `extractToken` checks header then cookie.
    // Let's assume cookies are primary but we can send header if we have it in store.
    return {};
};

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for cookies
});

const adminService = {
    addStudent: async (studentData) => {
        const response = await axiosInstance.post('/add-student', studentData);
        return response.data;
    },

    bulkAddStudents: async (studentsList) => {
        const response = await axiosInstance.post('/bulk-add-students', { students: studentsList });
        return response.data;
    },

    getStats: async () => {
        const response = await axiosInstance.get('/stats');
        return response.data;
    }
};

export default adminService;
