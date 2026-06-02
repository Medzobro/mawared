import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { Store, Pill, ShieldCheck, Lock, Eye, EyeOff, UserPlus, LogIn, Activity } from 'lucide-react';

type Tab = 'login' | 'register';
type AccountType = 'shop' | 'pharmacy';

export function Login() {
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const [tab, setTab] = useState<Tab>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Registration flow
  const [step, setStep] = useState<1 | 2>(1);
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('أدخل اسم المستخدم'); return; }
    if (!password.trim()) { setError('أدخل كلمة المرور'); return; }
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 600));
    // Check if user has stored account type
    const storedType = localStorage.getItem('mawared_account_type');
    login(username, storedType as AccountType || 'shop');
    setIsLoading(false);
    navigate('/dashboard', { replace: true });
  };

  const handleRegisterStart = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('أكمل جميع الحقول');
      return;
    }
    setStep(2);
  };

  const handleSelectAccountType = async (type: AccountType) => {
    setAccountType(type);
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 500));
    localStorage.setItem('mawared_account_type', type);
    login(username, type);
    setIsLoading(false);
    navigate('/dashboard', { replace: true });
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setError('');
    setStep(1);
    setAccountType(null);
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    resetForm();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden" dir="rtl">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient bg-[var(--bg-primary)]" />

      {/* Floating orbs */}
      <motion.div
        className="absolute rounded-full opacity-20"
        style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(20,184,166,0.35) 0%, transparent 70%)', top: '10%', left: '-5%' }}
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full opacity-15"
        style={{ width: 320, height: 320, background: 'radial-gradient(circle, rgba(15,118,110,0.4) 0%, transparent 70%)', bottom: '5%', right: '-5%' }}
        animate={{ x: [0, -30, 50, 0], y: [0, 20, -40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full opacity-10"
        style={{ width: 250, height: 250, background: 'radial-gradient(circle, rgba(20,184,166,0.3) 0%, transparent 70%)', top: '40%', right: '25%' }}
        animate={{ x: [0, 20, -10, 0], y: [0, -20, 10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="rounded-3xl p-8 sm:p-10"
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(40px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 64px -12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {/* Logo / Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 mb-5 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(15,118,110,0.3))',
                border: '1px solid rgba(20,184,166,0.2)',
              }}
            >
              <Store className="w-8 h-8 text-teal-400" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-[var(--text-primary)] mb-1"
            >
              مـورد
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-[var(--text-muted)]"
            >
              نظام إدارة المحلات والصيدليات الذكي
            </motion.p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-1 mb-6">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === 'login'
                  ? 'bg-[var(--accent)] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === 'register'
                  ? 'bg-[var(--accent)] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>إنشاء حساب</span>
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* LOGIN FORM */}
            {tab === 'login' && (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">اسم المستخدم</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="أدخل اسم المستخدم"
                      className="input-premium pr-11"
                      autoComplete="username"
                    />
                    <ShieldCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">كلمة المرور</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-premium pr-11 pl-10"
                      autoComplete="current-password"
                    />
                    <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileTap={{ scale: 0.98 }}
                  className="btn-premium w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 rounded-full border-2 border-white border-t-transparent"
                    />
                  ) : (
                    'تسجيل الدخول'
                  )}
                </motion.button>
              </motion.form>
            )}

            {/* REGISTER FORM */}
            {tab === 'register' && (
              <motion.div
                key="register-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 1 && (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleRegisterStart}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">اسم المستخدم</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="أدخل اسم المستخدم"
                          className="input-premium pr-11"
                          autoComplete="username"
                        />
                        <ShieldCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">كلمة المرور</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="input-premium pr-11 pl-10"
                          autoComplete="new-password"
                        />
                        <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      whileTap={{ scale: 0.98 }}
                      className="btn-premium w-full mt-2"
                    >
                      التالي
                    </motion.button>
                  </motion.form>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">اختر نوع حسابك</h3>
                      <p className="text-sm text-[var(--text-muted)]">اختر البيئة التي تناسب عملك — لا يمكن تغييرها لاحقاً بسهولة</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                        onClick={() => handleSelectAccountType('shop')}
                        className={`relative p-5 rounded-2xl border transition-all text-right ${
                          accountType === 'shop'
                            ? 'border-teal-500 bg-teal-500/10 glow-sm'
                            : 'border-[var(--border-subtle)] hover:border-teal-500/50 hover:bg-teal-500/5'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-700/20 flex items-center justify-center flex-shrink-0">
                            <Store className="w-7 h-7 text-teal-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-[var(--text-primary)]">محل تجاري</h4>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">إدارة المخزون، المنتجات، والفواتير لمحلك التجاري</p>
                          </div>
                          {accountType === 'shop' && <Activity className="w-5 h-5 text-teal-400" />}
                        </div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                        onClick={() => handleSelectAccountType('pharmacy')}
                        className={`relative p-5 rounded-2xl border transition-all text-right ${
                          accountType === 'pharmacy'
                            ? 'border-blue-500 bg-blue-500/10 glow-sm'
                            : 'border-[var(--border-subtle)] hover:border-blue-500/50 hover:bg-blue-500/5'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-700/20 flex items-center justify-center flex-shrink-0">
                            <Pill className="w-7 h-7 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-[var(--text-primary)]">صيدلية</h4>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">إدارة الأدوية، NDC، انتهاء الصلاحية، والروشتات</p>
                          </div>
                          {accountType === 'pharmacy' && <Activity className="w-5 h-5 text-blue-400" />}
                        </div>
                      </motion.button>
                    </div>

                    <button
                      onClick={() => setStep(1)}
                      className="w-full text-center text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] py-2 transition-colors"
                    >
                      عودة
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
