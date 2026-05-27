import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, token, refreshToken) => {
        localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        set({ user, token, refreshToken, isAuthenticated: true });
      },

      updateUser: (userData) => set((state) => ({ user: { ...state.user, ...userData } })),

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get('/api/auth/me');
          set({ user: data.user, isAuthenticated: true });
          return data.user;
        } catch {
          get().logout();
          return null;
        }
      },

      hasRole: (role) => {
        const user = get().user;
        if (!user) return false;
        if (Array.isArray(role)) return role.includes(user.role);
        return user.role === role;
      },

      isAdmin: () => get().user?.role === 'admin',
      isOrganizer: () => ['admin', 'organizer'].includes(get().user?.role)
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, refreshToken: state.refreshToken, isAuthenticated: state.isAuthenticated })
    }
  )
);

export default useAuthStore;
