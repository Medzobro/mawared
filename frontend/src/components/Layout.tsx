import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAppStore } from '../stores/appStore';

export function Layout() {
  const location = useLocation();
  const { setActiveRoute, sidebarCollapsed } = useAppStore();

  useEffect(() => {
    setActiveRoute(location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, setActiveRoute]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300"
      dir="rtl"
    >
      <Sidebar />
      <TopBar />

      <motion.main
        initial={false}
        animate={{
          paddingRight: sidebarCollapsed ? 80 : 260,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="pt-16 min-h-screen"
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto"
        >
          <Outlet />
        </motion.div>
      </motion.main>
    </div>
  );
}
