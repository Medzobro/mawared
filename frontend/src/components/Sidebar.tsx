import { useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Pill,
  QrCode,
  Settings,
  ChevronRight,
  ChevronLeft,
  Pill as PharmacyIcon,
  ShoppingBag,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../stores/appStore';

const menuItems = [
  { path: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { path: '/products',  key: 'products',  icon: Package },
  { path: '/pharmacy',  key: 'pharmacy_mode', icon: Pill },
  { path: '/qr',        key: 'qr_barcode',  icon: QrCode },
  { path: '/settings',  key: 'settings',    icon: Settings },
];

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { sidebarOpen, sidebarCollapsed, toggleSidebarCollapse, setSidebarOpen, mode } = useAppStore();

  const isActive = (path: string) => location.pathname === path;

  // Mode-aware accent colors
  const accent = mode === 'pharmacy'
    ? 'text-blue-600 dark:text-blue-400'
    : 'text-teal-600 dark:text-teal-400';
  const accentBg = mode === 'pharmacy'
    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/50'
    : 'bg-teal-50 dark:bg-teal-950/40 border-teal-100 dark:border-teal-900/50';
  const accentRing = mode === 'pharmacy'
    ? 'ring-blue-500'
    : 'ring-teal-500';
  const accentGradient = mode === 'pharmacy'
    ? 'from-blue-500 to-blue-700'
    : 'from-teal-500 to-teal-700';

  return (
    <>
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar — always visible on lg but collapsible */}
      <motion.aside
        ref={sidebarRef}
        initial={false}
        animate={{
          width: sidebarCollapsed ? 80 : 260,
          x: 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-full z-50 hidden lg:flex flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-2xl"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--border-subtle)]">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                key="logo"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center shadow-lg`}>
                  {mode === 'pharmacy' ? (
                    <PharmacyIcon className="w-5 h-5 text-white" />
                  ) : (
                    <ShoppingBag className="w-5 h-5 text-white" />
                  )}
                </div>
                <span className="text-lg font-bold text-gradient">مورد</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebarCollapse}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors"
          >
            <AnimatePresence mode="wait">
              {sidebarCollapsed ? (
                <motion.div
                  key="expand"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="collapse"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto no-scrollbar">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 group ${
                        isActive
                          ? accent
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                      }`
                    }
                  >
                    {active && (
                      <motion.div
                        layoutId="desktop-active-indicator"
                        className={`absolute inset-0 rounded-xl ${accentBg}`}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-3 w-full">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                      </motion.div>

                      <AnimatePresence>
                        {!sidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-sm font-medium whitespace-nowrap overflow-hidden"
                          >
                            {t(`sidebar.${item.key}`)}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>

                    {active && !sidebarCollapsed && (
                      <motion.div
                        layoutId="desktop-active-dot"
                        className={`absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${
                          mode === 'pharmacy' ? 'bg-blue-500' : 'bg-teal-500'
                        }`}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer / Mode badge */}
        <div className="p-3 border-t border-[var(--border-subtle)]">
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-center text-[var(--text-muted)] py-2 space-y-1"
              >
                <div className="flex items-center justify-center gap-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${mode === 'pharmacy' ? 'bg-blue-500' : 'bg-teal-500'}`} />
                  <span>{mode === 'pharmacy' ? t('sidebar.pharmacy_mode') : t('sidebar.dashboard')}</span>
                </div>
                <span>v1.0.0 — مورد</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* Mobile Drawer — slides in from the right (RTL) */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-[260px] z-50 flex flex-col bg-[var(--bg-primary)]/95 backdrop-blur-2xl border-l border-[var(--border-subtle)] lg:hidden"
          >
            <div className="flex items-center h-16 px-5 border-b border-[var(--border-subtle)] gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center shadow-lg`}>
                {mode === 'pharmacy' ? (
                  <PharmacyIcon className="w-5 h-5 text-white" />
                ) : (
                  <ShoppingBag className="w-5 h-5 text-white" />
                )}
              </div>
              <span className="text-lg font-bold text-gradient">مورد</span>
            </div>

            <nav className="flex-1 py-4 px-3 overflow-y-auto">
              <ul className="space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 ${
                            isActive
                              ? accent
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                          }`
                        }
                      >
                        {active && (
                          <motion.div
                            layoutId="mobile-active"
                            className={`absolute inset-0 rounded-xl ${accentBg}`}
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-3">
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm font-medium">{t(`sidebar.${item.key}`)}</span>
                        </span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="px-5 py-4 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className={`inline-block w-2 h-2 rounded-full ${mode === 'pharmacy' ? 'bg-blue-500' : 'bg-teal-500'}`} />
                <span>{mode === 'pharmacy' ? t('sidebar.pharmacy_mode') : 'المحل'}</span>
                <span className="mr-auto">v1.0</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
