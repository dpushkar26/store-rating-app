import { create } from 'zustand';

// Attempt to load existing session from localStorage on app start
const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
const storedToken = localStorage.getItem('token') || null;

export const useAuthStore = create((set) => ({
  user: storedUser,
  token: storedToken,
  
  login: (userData, tokenData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
    set({ user: userData, token: tokenData });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  }
}));