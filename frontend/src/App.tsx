import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from './components/Layout';

/* Pages */
const DashboardPage = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ProductsPage = lazy(() => import('./pages/Products').then(m => ({ default: m.Products })));
const SettingsPage = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const QrPage = lazy(() => import('./pages/QrPage').then(m => ({ default: m.QrPage })));
const PharmacyPage = lazy(() => import('./pages/Pharmacy').then(m => ({ default: m.Pharmacy })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent"
      />
    </div>
  );
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/pharmacy" element={<PharmacyPage />} />
            <Route path="/qr" element={<QrPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}
