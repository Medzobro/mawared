import { useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Pill, QrCode, Settings,
  ChevronRight, ChevronLeft, ShoppingBag, ShoppingCart,
  Receipt, Users, DollarSign, CreditCard, Briefcase, TrendingUp, Truck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../stores/appStore';

/* Mode-aware menu + new ERP items */
const SHOP_ITEMS = [
  { path: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { path: '/pos', key: 'pos', icon: ShoppingCart },
  { path: '/products', key: 'products', icon: Package },
  { path: '/transactions', key: 'transactions', icon: Receipt },
  { path: '/suppliers', key: 'suppliers', icon: Truck },
  { path: '/customers', key: 'customers', icon: Users },
  { path: '/expenses', key: 'expenses', icon: DollarSign },
  { path: '/employees', key: 'employees', icon: Briefcase },
  { path: '/reports', key: 'reports', icon: TrendingUp },
  { path: '/qr', key: 'qr_barcode', icon: QrCode },
  { path: '/settings', key: 'settings', icon: Settings },
];

const PHARMACY_ITEMS = [
  { path: '/dashboard', key: 'dashboard', icon: LayoutDashboard },
  { path: '/pos', key: 'pos', icon: ShoppingCart },
  { path: '/pharmacy', key: 'pharmacy_mode', icon: Pill },
  { path: '/products', key: 'products', icon: Package },
  { path: '/transactions', key: 'transactions', icon: Receipt },
  { path: '/suppliers', key: 'suppliers', icon: Truck },
  { path: '/customers', key: 'customers', icon: Users },
  { path: '/expenses', key: 'expenses', icon: DollarSign },
  { path: '/employees', key: 'employees', icon: Briefcase },
  { path: '/reports', key: 'reports', icon: TrendingUp },
  { path: '/qr', key: 'qr_barcode', icon: QrCode },
  { path: '/settings', key: 'settings', icon: Settings },
];

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { sidebarOpen, sidebarCollapsed, toggleSidebarCollapse, setSidebarOpen, mode } = useAppStore();

  const menuItems = mode === 'pharmacy' ? PHARMACY_ITEMS : SHOP_ITEMS;
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/dashboard') return currentPath === '/dashboard' || currentPath === '/';
    if (path === '/pos') return currentPath === '/pos';
    return currentPath === path;
  };

  const accent = mode === 'pharmacy'
    ? 'text-blue-600 dark:text-blue-400'
    : 'text-teal-600 dark:text-teal-400';
  const accentBg = mode === 'pharmacy'
    ? 'bg-blue-50/80 dark:bg-blue-950/60'
    : 'bg-teal-50/80 dark:bg-teal-950/60';
  const accentBorder = mode === 'pharmacy'
    ? 'border-blue-500 dark:border-blue-400'
    : 'border-teal-500 dark:border-teal-400';
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
            className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full z-50 hidden lg:flex flex-col border-l border-[var(--border-subtle)] transition-all duration-300 ease-out ${
          sidebarCollapsed ? 'w-20' : 'w-[270px]'
        }`}
        style={{
          background: 'var(--bg-primary)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
              {mode === 'pharmacy' ? (
                <Pill className="w-5 h-5 text-white" />
              ) : (
                <ShoppingBag className="w-5 h-5 text-white" />
              )}
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-bold text-gradient whitespace-nowrap">مورد</span>
            )}
          </div>
          <button
            onClick={toggleSidebarCollapse}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors flex-shrink-0"
          >
            {sidebarCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto no-scrollbar">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.path} className="relative">
                  <NavLink
                    to={item.path}
                    end={item.path === '/dashboard'}
                    onClick={() => setSidebarOpen(false)}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      active
                        ? `${accent} ${accentBg}`
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <motion.div
                        layoutId="sidebar-active-bar"
                        className={`absolute -right-3 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full ${accentBorder} bg-current`}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    {/* Animated active background pill */}
                    {active && !sidebarCollapsed && (
                      <motion.div
                        layoutId="sidebar-active-bg"
                        className={`absolute inset-0 rounded-xl ${accentBg} border ${accentBorder}`}
                        initial={false}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className={`relative z-10 flex items-center gap-3 w-full ${sidebarCollapsed ? 'justify-center' : ''}`}>
                      <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
                      {!sidebarCollapsed && (
                        <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
                          {t(`sidebar.${item.key}`)}
                        </span>
                      )}
                    </span>
                    {/* Tooltip when collapsed */}
                    {sidebarCollapsed && (
                      <div className="absolute right-full mr-2 px-2 py-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-lg">
                        {t(`sidebar.${item.key}`)}
                      </div>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border-subtle)]">
          {!sidebarCollapsed && (
            <div className="text-xs text-center text-[var(--text-muted)] py-2">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className={`inline-block w-2 h-2 rounded-full ${mode === 'pharmacy' ? 'bg-blue-500' : 'bg-teal-500'}`} />
                <span>{t(mode === 'pharmacy' ? 'sidebar.pharmacy_mode' : 'sidebar.shop')}</span>
              </div>
              <span>v3.0 — MAWARED</span>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="flex justify-center">
              <span className={`inline-block w-2 h-2 rounded-full ${mode === 'pharmacy' ? 'bg-blue-500' : 'bg-teal-500'}`} />
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed top-0 right-0 h-full w-[270px] z-50 flex flex-col bg-[var(--bg-primary)] border-l border-[var(--border-subtle)] lg:hidden"
          >
            <div className="flex items-center h-16 px-5 border-b border-[var(--border-subtle)] gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center shadow-lg`}>
                {mode === 'pharmacy' ? (
                  <Pill className="w-5 h-5 text-white" />
                ) : (
                  <ShoppingBag className="w-5 h-5 text-white" />
                )}
              </div>
              <span className="text-lg font-bold text-gradient">مورد</span>
            </div>

            <nav className="flex-1 py-4 px-3 overflow-y-auto">
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <li key={item.path} className="relative">
                      <NavLink
                        to={item.path}
                        end={item.path === '/dashboard'}
                        onClick={() => setSidebarOpen(false)}
                        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                          active
                            ? `${accent} ${accentBg}`
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                        }`}
                      >
                        {/* Active indicator bar */}
                        {active && (
                          <motion.div
                            layoutId="sidebar-mobile-bar"
                            className={`absolute -right-3 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full ${accentBorder} bg-current`}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        {/* Active background */}
                        {active && (
                          <motion.div
                            layoutId="sidebar-mobile-bg"
                            className={`absolute inset-0 rounded-xl ${accentBg} border ${accentBorder}`}
                            initial={false}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-3">
                          <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'scale-110' : ''}`} />
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
                <span>{t(mode === 'pharmacy' ? 'sidebar.pharmacy_mode' : 'sidebar.shop')}</span>
                <span className="mr-auto">v3.0</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
