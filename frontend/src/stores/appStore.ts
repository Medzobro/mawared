import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '../api';

export type AppMode = 'shop' | 'pharmacy';
export type Theme = 'light' | 'dark' | 'system';
export type Language = 'ar' | 'en' | 'fr';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date;
}

export interface User {
  username: string;
  name?: string;
  role?: string;
}

interface AppState {
  mode: AppMode;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: Theme;
  language: Language;
  notifications: Notification[];
  activeRoute: string;

  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loginLoading: boolean;
  loginError: string | null;

  setMode: (mode: AppMode) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  setActiveRoute: (route: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;

  loginApi: (username: string, password: string, accountType?: AppMode) => Promise<void>;
  registerApi: (username: string, password: string, accountType?: AppMode) => Promise<void>;
  logout: () => void;

  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: () => number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      mode: 'shop',
      sidebarOpen: false,
      sidebarCollapsed: false,
      theme: 'system',
      language: 'ar',
      notifications: [],
      activeRoute: '/dashboard',
      isAuthenticated: false,
      user: null,
      token: null,
      loginLoading: false,
      loginError: null,

      setMode: (mode) => {
        set({ mode });
        document.documentElement.setAttribute('data-mode', mode);
      },
      setTheme: (theme) => {
        set({ theme });
        const root = document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else if (theme === 'light') root.classList.remove('dark');
        else {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark');
          else root.classList.remove('dark');
        }
      },
      setLanguage: (lang) => {
        set({ language: lang });
        const root = document.documentElement;
        if (lang === 'ar') { root.setAttribute('dir', 'rtl'); root.setAttribute('lang', 'ar'); }
        else { root.setAttribute('dir', 'ltr'); root.setAttribute('lang', lang); }
      },
      setActiveRoute: (route) => set({ activeRoute: route }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      loginApi: async (username, password, accountType) => {
        set({ loginLoading: true, loginError: null });
        try {
          const res = await auth.login({ username, password });
          localStorage.setItem('mawared_token', res.access_token);
          const mode = accountType || 'shop';
          set({ token: res.access_token, isAuthenticated: true, loginLoading: false, user: { username, name: username }, mode });
          document.documentElement.setAttribute('data-mode', mode);
        } catch (e: any) {
          set({ loginLoading: false, loginError: e.message || 'Login failed' });
          throw e;
        }
      },
      registerApi: async (username, password, accountType) => {
        set({ loginLoading: true, loginError: null });
        try {
          const res = await auth.register({ username, password });
          localStorage.setItem('mawared_token', res.access_token);
          const mode = accountType || 'shop';
          set({ token: res.access_token, isAuthenticated: true, loginLoading: false, user: { username, name: username }, mode });
          document.documentElement.setAttribute('data-mode', mode);
        } catch (e: any) {
          set({ loginLoading: false, loginError: e.message || 'Registration failed' });
          throw e;
        }
      },
      logout: () => {
        localStorage.removeItem('mawared_token');
        set({ isAuthenticated: false, user: null, mode: 'shop', activeRoute: '/dashboard', token: null });
        document.documentElement.setAttribute('data-mode', 'shop');
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date(),
          read: false,
        };
        set((state) => ({ notifications: [newNotification, ...state.notifications].slice(0, 50) }));
      },
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearNotifications: () => set({ notifications: [] }),
      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    {
      name: 'mawared-app-storage',
      partialize: (state) => ({
        mode: state.mode,
        sidebarOpen: state.sidebarOpen,
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        language: state.language,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);

useAppStore.getState().setTheme(useAppStore.getState().theme);
