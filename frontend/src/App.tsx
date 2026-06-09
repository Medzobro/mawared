import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from './components/Layout';
import { useAppStore } from './stores/appStore';
import { getLanguageDirection } from './i18n/i18n';

const LoginPage       = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const DashboardPage   = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ProductsPage    = lazy(() => import('./pages/Products').then(m => ({ default: m.Products })));
const SettingsPage    = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const QrPage          = lazy(() => import('./pages/QrPage').then(m => ({ default: m.QrPage })));
const PharmacyPage    = lazy(() => import('./pages/Pharmacy').then(m => ({ default: m.Pharmacy })));
const TransactionsPage= lazy(() => import('./pages/Transactions').then(m => ({ default: m.Transactions })));
const ExpensesPage    = lazy(() => import('./pages/Expenses').then(m => ({ default: m.Expenses })));
const EmployeesPage   = lazy(() => import('./pages/Employees').then(m => ({ default: m.Employees })));
const SuppliersPage   = lazy(() => import('./pages/Suppliers').then(m => ({ default: m.Suppliers })));
const CustomersPage   = lazy(() => import('./pages/Customers').then(m => ({ default: m.Customers })));
const ReportsPage     = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));

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
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
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
