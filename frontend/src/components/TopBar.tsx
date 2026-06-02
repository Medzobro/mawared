import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Menu,
  X,
  Sun,
  Moon,
  ShoppingBag,
  Pill,
  Check,
  Trash2,
  LogOut,
  User,
  ChevronLeft,
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';

export function TopBar() {
  const navigate = useNavigate();
  const {
    mode,
    toggleMode,
    theme,
    setTheme,
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    toggleSidebar,
    sidebarOpen,
    sidebarCollapsed,
  } = useAppStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unread = unreadCount();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'success': return <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center"><Check className="w-4 h-4 text-emerald-500" /></div>;
      case 'warning': return <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center"><Bell className="w-4 h-4 text-amber-500" /></div>;
      case 'error': return <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center"><Trash2 className="w-4 h-4 text-red-500" /></div>;
      default: return <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center"><Bell className="w-4 h-4 text-teal-500" /></div>;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-16 z-30 bg-[var(--bg-primary)]/70 backdrop-blur-xl border-b border-[var(--border-subtle)] transition-[padding] duration-300 ease-out ${sidebarCollapsed ? 'lg:pr-[72px]' : 'lg:pr-[260px]'}`}
    >
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>

          <div ref={searchRef} className="relative">
            <motion.div
              animate={{ width: searchOpen ? 280 : 44 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className="h-11 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center overflow-hidden"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setSearchOpen(true);
                  setTimeout(() => document.getElementById('global-search')?.focus(), 100);
                }}
                className="w-11 h-11 flex-shrink-0 flex items-center justify-center text-[var(--text-muted)]"
              >
                <Search className="w-5 h-5" />
              </motion.button>

              <AnimatePresence>
                {searchOpen && (
                  <>
                    <motion.input
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      id="global-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="بحث في المنتجات، المعاملات..."
                      className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] pr-2"
                    />
                    {searchQuery && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setSearchQuery('')}
                        className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMode}
            className="relative h-9 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]"
          >
            <motion.div
              layoutId="mode-indicator"
              className="absolute inset-0 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50"
              style={{ opacity: mode === 'shop' ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
            <span className={`relative z-10 flex items-center gap-1.5 ${mode === 'shop' ? 'text-teal-600 dark:text-teal-400' : ''}`}>
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">متجر</span>
            </span>
            <span className="text-[var(--border-medium)]">|</span>
            <span className={`relative z-10 flex items-center gap-1.5 ${mode === 'pharmacy' ? 'text-teal-600 dark:text-teal-400' : ''}`}>
              <Pill className="w-4 h-4" />
              <span className="hidden sm:inline">صيدلي</span>
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors"
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div key="moon" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div key="sun" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <div ref={notifRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[var(--bg-primary)]"
                >
                  {unread}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  className="absolute left-0 top-14 w-80 sm:w-96 bg-[var(--bg-card)] backdrop-blur-2xl border border-[var(--border-subtle)] rounded-2xl shadow-2xl shadow-black/10 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">الإشعارات</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-teal-600 dark:text-teal-400 hover:underline px-2 py-1 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/30"
                    >
                      تعليم الكل كمقروء
                    </motion.button>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-[var(--text-muted)]">
                        <Bell className="w-8 h-8 mb-2 opacity-30" />
                        <p className="text-sm">لا توجد إشعارات</p>
                      </div>
                    ) : (
                      notifications.map((notif, i) => (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer border-b border-[var(--border-subtle)] last:border-b-0 ${!notif.read ? 'bg-teal-50/30 dark:bg-teal-950/10' : ''}`}
                          onClick={() => markNotificationAsRead(notif.id)}
                        >
                          {getNotifIcon(notif.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{notif.title}</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[11px] text-[var(--text-muted)] mt-1">
                              {new Date(notif.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}
                            onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                            className="text-[var(--text-muted)] hover:text-red-500 transition-colors mt-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </motion.button>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 pl-2 pr-1 h-10 rounded-xl hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xs font-bold">
                مـ
              </div>
              <span className="hidden md:inline text-sm font-medium text-[var(--text-primary)]">مدير النظام</span>
              <ChevronLeft className="hidden md:inline w-4 h-4 text-[var(--text-muted)]" />
            </motion.button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  className="absolute left-0 top-14 w-56 bg-[var(--bg-card)] backdrop-blur-2xl border border-[var(--border-subtle)] rounded-2xl shadow-2xl shadow-black/10 overflow-hidden"
                >
                  <div className="p-4 border-b border-[var(--border-subtle)]">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">مدير النظام</p>
                    <p className="text-xs text-[var(--text-muted)]">admin@mawared.app</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                      <User className="w-4 h-4" />
                      الملف الشخصي
                    </button>
                    <button
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
