import { create } from 'zustand';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (token, user) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  initialize: () => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as AuthUser;
        set({ token, user, isAuthenticated: true });
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
  },
}));
