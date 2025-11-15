import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken') || null,

  setSession: ({ user, accessToken }) => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    set({ user, accessToken });
  },

  clearSession: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    set({ user: null, accessToken: null });
  },
}));
