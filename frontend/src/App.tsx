import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Layout } from './components/Layout';
import { useAppStore } from './stores/appStore';
import { getLanguageDirection } from './i18n/i18n';

/* Lazy Pages */
const LoginPage     = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const ModeSelectPage= lazy(() => import('./pages/ModeSelect').then(m => ({ default: m.ModeSelect })));
const DashboardPage = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ProductsPage  = lazy(() => import('./pages/Products').then(m => ({ default: m.Products })));
const SettingsPage  = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const QrPage        = lazy(() => import('./pages/QrPage').then(m => ({ default: m.QrPage })));
const PharmacyPage  = lazy(() => import('./pages/Pharmacy').then(m => ({ default: m.Pharmacy })));

function PageLoader() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent"
      />
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const dir = getLanguageDirection();
  return (
    <div dir={dir}>
      <AnimatePresence mode="wait">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<AuthGuard><LoginPage /></AuthGuard>} />

            {/* Protected layout routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/mode-select" element={<ModeSelectPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/pharmacy" element={<PharmacyPage />} />
              <Route path="/qr" element={<QrPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </AnimatePresence>
    </div>
  );
}
