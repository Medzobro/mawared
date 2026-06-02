import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Menu,
  X,
  Sun,
  Moon,
  Check,
  LogOut,
  User,
  ChevronLeft,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../stores/appStore';

export function TopBar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    mode,
    theme,
    setTheme,
    sidebarCollapsed,
    toggleSidebar,
    sidebarOpen,
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    logout,
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
  const lang = i18n.language || 'ar';
  const locale = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US';

  const getNotifIcon = useCallback((type: string) => {
    const cls = (bg: string, text: string) => (
      <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center`}>
        <Check className={`w-4 h-4 ${text}`} />
      </div>
    );
    switch (type) {
      case 'success': return cls('bg-emerald-50 dark:bg-emerald-950/40', 'text-emerald-500');
      case 'warning': return cls('bg-amber-50 dark:bg-amber-950/40', 'text-amber-500');
      case 'error': return cls('bg-red-50 dark:bg-red-950/40', 'text-red-500');
      default: return cls('bg-teal-50 dark:bg-teal-950/40', 'text-teal-500');
    }
  }, []);

  const modeLabel = lang === 'ar'
    ? (mode === 'shop' ? 'المحل' : 'صيدلية')
    : lang === 'fr'
    ? (mode === 'shop' ? 'Magasin' : 'Pharmacie')
    : (mode === 'shop' ? 'Shop' : 'Pharmacy');

  return (
    <header
      className={`fixed top-0 left-0 right-0 h-16 z-30 bg-[var(--bg-primary)]/70 backdrop-blur-xl border-b border-[var(--border-subtle)] transition-[padding] duration-300 ease-out ${
        sidebarCollapsed ? 'lg:pr-[80px]' : 'lg:pr-[260px]'
      }`}
      dir="rtl"
    >
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        {/* Left side */}
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
            <div
              className={`h-11 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center overflow-hidden transition-all duration-300 ${
                searchOpen ? 'w-[240px] sm:w-[280px]' : 'w-11'
              }`}
            >
              <button
                onClick={() => { setSearchOpen(true); setTimeout(() => document.getElementById('global-search')?.focus(), 100); }}
                className="w-11 h-11 flex-shrink-0 flex items-center justify-center text-[var(--text-muted)]"
              >
                <Search className="w-5 h-5" />
              </button>

              {searchOpen && (
                <input
                  id="global-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('topbar.search')}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] pr-2"
                >
                </input>
              )}
              {searchOpen && searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Mode badge */}
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${mode === 'pharmacy' ? 'bg-blue-500' : 'bg-teal-500'}`} />
            {modeLabel}
          </span>

          {/* Theme */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors"
          >
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => setNotifOpen((s) => !s)}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
            >
              <Bell className="w-4 h-4" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-12 w-80 sm:w-96 bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden max-h-[80vh]"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
                    <span className="text-sm font-semibold">{t('topbar.notifications')}</span>
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-[var(--accent)] hover:underline"
                    >
                      تعليم الكل
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-[var(--text-muted)]">
                        <Bell className="w-8 h-8 mb-2 opacity-30" />
                        <p className="text-sm">لا توجد إشعارات</p>
                      </div>
                    ) : (
                      notifications.map((notif, i) => (
                        <div
                          key={notif.id}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer border-b border-[var(--border-subtle)] last:border-b-0 ${
                            !notif.read ? 'bg-teal-50/30 dark:bg-teal-950/10' : ''
                          }`}
                          onClick={() => markNotificationAsRead(notif.id)}
                        >
                          {getNotifIcon(notif.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{notif.title}</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[11px] text-[var(--text-muted)] mt-1">
                              {new Date(notif.timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
                            className="text-[var(--text-muted)] hover:text-red-500 mt-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen((s) => !s)}
              className="flex items-center gap-2 pl-2 pr-1 h-10 rounded-xl hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white text-xs font-bold">
                مـ
              </div>
              <ChevronLeft className="hidden md:inline w-4 h-4 text-[var(--text-muted)]" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 top-12 w-56 bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-[var(--border-subtle)]">
                    <p className="text-sm font-semibold">{t('topbar.profile')}</p>
                    <p className="text-xs text-[var(--text-muted)]">{modeLabel}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                      <User className="w-4 h-4" />
                      {t('topbar.profile')}
                    </button>
                    <button
                      onClick={() => { logout(); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('topbar.logout')}
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
