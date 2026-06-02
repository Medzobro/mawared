import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppMode = 'shop' | 'pharmacy';
export type Theme = 'light' | 'dark' | 'system';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date;
}

interface AppState {
  mode: AppMode;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: Theme;
  notifications: Notification[];
  activeRoute: string;

  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  setTheme: (theme: Theme) => void;
  setActiveRoute: (route: string) => void;

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
      sidebarOpen: true,
      sidebarCollapsed: false,
      theme: 'system',
      notifications: [],
      activeRoute: '/dashboard',

      setMode: (mode) => {
        set({ mode });
        document.documentElement.setAttribute('data-mode', mode);
      },
      toggleMode: () => {
        const newMode = get().mode === 'shop' ? 'pharmacy' : 'shop';
        set({ mode: newMode });
        document.documentElement.setAttribute('data-mode', newMode);
      },
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
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
      setActiveRoute: (route) => set({ activeRoute: route }),

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
      }),
    }
  )
);
