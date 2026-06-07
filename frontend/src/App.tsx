import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from './components/Layout';
import { useAppStore } from './stores/appStore';
import { getLanguageDirection } from './i18n/i18n';

const LoginPage           = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const DashboardPage       = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ProductsPage        = lazy(() => import('./pages/Products').then(m => ({ default: m.Products })));
const SettingsPage        = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const QrPage              = lazy(() => import('./pages/QrPage').then(m => ({ default: m.QrPage })));
const PharmacyPage        = lazy(() => import('./pages/Pharmacy').then(m => ({ default: m.Pharmacy })));
const ExpensesPage        = lazy(() => import('./pages/Expenses').then(m => ({ default: m.Expenses })));
const EmployeeExpensesPage = lazy(() => import('./pages/EmployeeExpenses').then(m => ({ default: m.EmployeeExpenses })));

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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  const dir = getLanguageDirection();
  return (
    <div dir={dir}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<AuthGuard><LoginPage /></AuthGuard>} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/pharmacy" element={<PharmacyPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/employee-expenses" element={<EmployeeExpensesPage />} />
            <Route path="/qr" element={<QrPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}
