import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { Store, Pill, Lock, Eye, EyeOff, LogIn, UserPlus, Globe, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { toArabicNumerals } from '../i18n/helpers';

type AccountType = 'shop' | 'pharmacy';
type LangKey = 'ar' | 'en' | 'fr';

const LANG_CONFIG: Record<LangKey, { label: string; flag: string; dir: 'rtl' | 'ltr' }> = {
  ar: { label: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  en: { label: 'English', flag: '🇬🇧', dir: 'ltr' },
  fr: { label: 'Français', flag: '🇫🇷', dir: 'ltr' },
};

const TRANSLATIONS: Record<LangKey, Record<string, string>> = {
  ar: {
    title: 'مـورد',
    subtitle: 'نظام إدارة المحلات والصيدليات الذكي',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    username: 'اسم المستخدم',
    password: 'كلمة المرور',
    usernamePlaceholder: 'أدخل اسمك',
    passwordPlaceholder: '••••••',
    forgotPassword: 'نسيت كلمة المرور؟',
    noAccount: 'لا تمتلك حساباً؟',
    hasAccount: 'لديك حساب؟',
    createNow: 'أنشئ حساباً',
    loginNow: 'سجل دخول',
    shop: 'محل تجاري',
    pharmacy: 'صيدلية',
    shopDesc: 'إدارة المنتجات والمخزون',
    pharmacyDesc: 'إدارة الأدوية والوصفات',
    selectType: 'اختر نوع حسابك',
    typeFixed: 'نوع الحساب:',
    validationUsername: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل',
    validationPassword: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    loading: 'جاري التحميل...',
    errorLogin: 'اسم المستخدم أو كلمة المرور غير صحيحة',
    errorRegister: 'اسم المستخدم مستخدم بالفعل',
    errorGeneric: 'حدث خطأ، حاول مرة أخرى',
    stepAccountType: 'اختيار نوع الحساب',
    back: 'العودة',
    confirm: 'تأكيد',
  },
  en: {
    title: 'MAWARED',
    subtitle: 'Smart Store & Pharmacy Management',
    login: 'Login',
    register: 'Create Account',
    username: 'Username',
    password: 'Password',
    usernamePlaceholder: 'Enter your name',
    passwordPlaceholder: '••••••',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    createNow: 'Sign up',
    loginNow: 'Log in',
    shop: 'Shop',
    pharmacy: 'Pharmacy',
    shopDesc: 'Manage products & inventory',
    pharmacyDesc: 'Manage medicines & prescriptions',
    selectType: 'Select account type',
    typeFixed: 'Account type:',
    validationUsername: 'Username must be at least 3 characters',
    validationPassword: 'Password must be at least 6 characters',
    loading: 'Loading...',
    errorLogin: 'Invalid username or password',
    errorRegister: 'Username already taken',
    errorGeneric: 'Something went wrong, try again',
    stepAccountType: 'Choose account type',
    back: 'Back',
    confirm: 'Confirm',
  },
  fr: {
    title: 'MAWARED',
    subtitle: 'Gestion intelligente des magasins & pharmacies',
    login: 'Connexion',
    register: 'Créer un compte',
    username: "Nom d'utilisateur",
    password: 'Mot de passe',
    usernamePlaceholder: 'Entrez votre nom',
    passwordPlaceholder: '••••••',
    forgotPassword: 'Mot de passe oublié?',
    noAccount: "Vous n'avez pas de compte?",
    hasAccount: 'Vous avez déjà un compte?',
    createNow: "S'inscrire",
    loginNow: 'Se connecter',
    shop: 'Magasin',
    pharmacy: 'Pharmacie',
    shopDesc: 'Gérer les produits & stocks',
    pharmacyDesc: 'Gérer les médicaments & ordonnances',
    selectType: 'Choisir le type de compte',
    typeFixed: 'Type de compte:',
    validationUsername: "Le nom doit contenir au moins 3 caractères",
    validationPassword: 'Le mot de passe doit contenir au moins 6 caractères',
    loading: 'Chargement...',
    errorLogin: "Nom d'utilisateur ou mot de passe invalide",
    errorRegister: "Nom d'utilisateur déjà utilisé",
    errorGeneric: 'Une erreur est survenue, réessayez',
    stepAccountType: 'Choisir le type de compte',
    back: 'Retour',
    confirm: 'Confirmer',
  },
};

export function Login() {
  const navigate = useNavigate();
  const { loginApi, registerApi, loginLoading, loginError, setMode } = useAppStore();
  const { i18n } = useTranslation();

  const [lang, setLang] = useState<LangKey>((i18n.language as LangKey) || 'ar');
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>('shop');
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});

  const t = TRANSLATIONS[lang];
  const dir = LANG_CONFIG[lang].dir;

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    i18next.changeLanguage(lang);
  }, [lang]);

  const validate = (): boolean => {
    const errors: { username?: string; password?: string } = {};
    if (!username.trim() || username.trim().length < 3) errors.username = t.validationUsername;
    if (!password.trim() || password.trim().length < 6) errors.password = t.validationPassword;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    if (tab === 'register' && step === 1) {
      setStep(2);
      return;
    }

    try {
      if (tab === 'login') {
        await loginApi(username, password);
      } else {
        await registerApi(username, password, accountType);
      }
      navigate('/dashboard', { replace: true });
    } catch (e: any) {
      setError(e.message || t.errorGeneric);
    }
  };

  const handleAccountSelect = async (type: AccountType) => {
    setAccountType(type);
    setMode(type);
    try {
      await registerApi(username, password, type);
      navigate('/dashboard', { replace: true });
    } catch (e: any) {
      setError(e.message || t.errorGeneric);
    }
  };

  const switchTab = (t: 'login' | 'register') => {
    setTab(t);
    setError('');
    setFieldErrors({});
    setStep(1);
  };

  const changeLang = (l: LangKey) => {
    setLang(l);
    i18next.changeLanguage(l);
    localStorage.setItem('mawared_language', l);
  };

  const isShopActive = accountType === 'shop';
  const isPharmacyActive = accountType === 'pharmacy';

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden" dir={dir}>
      {/* Animated background */}
      <div className="absolute inset-0 mesh-gradient bg-[var(--bg-primary)]" />
      <motion.div className="absolute rounded-full opacity-20 blur-3xl"
        style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(20,184,166,0.4) 0%, transparent 70%)', top: '8%', left: '-8%' }}
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div className="absolute rounded-full opacity-15 blur-3xl"
        style={{ width: 320, height: 320, background: 'radial-gradient(circle, rgba(15,118,110,0.5) 0%, transparent 70%)', bottom: '5%', right: '-5%' }}
        animate={{ x: [0, -30, 50, 0], y: [0, 20, -40, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="rounded-3xl p-6 sm:p-8"
          style={{
            background: 'rgba(17,17,24,0.85)',
            backdropFilter: 'blur(40px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 32px 64px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          {/* Language Selector - Top */}
          <div className="flex items-center justify-center gap-1 mb-6">
            {(Object.keys(LANG_CONFIG) as LangKey[]).map((l) => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  lang === l
                    ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                <span className="mr-1">{LANG_CONFIG[l].flag}</span>
                {LANG_CONFIG[l].label}
              </button>
            ))}
          </div>

          {/* Logo / Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 mb-3 rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-lg"
              style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(15,118,110,0.25))' }}
            >
              <img
                src="/logo-brand.jpg"
                alt="MAWARED Logo"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-[var(--text-primary)] mb-1"
            >
              {t.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-[var(--text-muted)]"
            >
              {t.subtitle}
            </motion.p>
          </div>

          {/* Account Type Selection - Always visible for Register */}
          {tab === 'register' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5"
            >
              <p className="text-xs text-[var(--text-muted)] mb-2 text-center">{t.selectType}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAccountType('shop')}
                  className={`relative p-3 rounded-xl border transition-all text-center ${
                    isShopActive
                      ? 'border-teal-500/50 bg-teal-500/10'
                      : 'border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${isShopActive ? 'bg-gradient-to-br from-teal-500 to-teal-700' : 'bg-[var(--bg-elevated)]'}`}>
                    <Store className={`w-5 h-5 ${isShopActive ? 'text-white' : 'text-teal-500/60'}`} />
                  </div>
                  <p className={`text-sm font-semibold ${isShopActive ? 'text-teal-400' : 'text-[var(--text-secondary)]'}`}>{t.shop}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{t.shopDesc}</p>
                  {isShopActive && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-500" />}
                </button>

                <button
                  type="button"
                  onClick={() => setAccountType('pharmacy')}
                  className={`relative p-3 rounded-xl border transition-all text-center ${
                    isPharmacyActive
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${isPharmacyActive ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-[var(--bg-elevated)]'}`}>
                    <Pill className={`w-5 h-5 ${isPharmacyActive ? 'text-white' : 'text-blue-500/60'}`} />
                  </div>
                  <p className={`text-sm font-semibold ${isPharmacyActive ? 'text-blue-400' : 'text-[var(--text-secondary)]'}`}>{t.pharmacy}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{t.pharmacyDesc}</p>
                  {isPharmacyActive && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />}
                </button>
              </div>
            </motion.div>
          )}

          {/* Login/Register Tabs */}
          <div className="flex rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-1 mb-5">
            <button
              onClick={() => switchTab('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === 'login'
                  ? 'bg-[var(--accent)] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <LogIn className="w-4 h-4" /> {t.login}
            </button>
            <button
              onClick={() => switchTab('register')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === 'register'
                  ? 'bg-[var(--accent)] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <UserPlus className="w-4 h-4" /> {t.register}
            </button>
          </div>

          {/* Form */}
          <motion.form
            key={tab}
            onSubmit={handleSubmit}
            method="post"
            autoComplete="off"
            initial={{ opacity: 0, x: tab === 'login' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                {t.username}
              </label>
              <div className="relative">
                <Store className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setFieldErrors(p => ({ ...p, username: undefined })); }}
                  required
                  className={`input-premium w-full pr-10 ${fieldErrors.username ? 'border-red-500/50 focus:border-red-500' : ''}`}
                  placeholder={t.usernamePlaceholder}
                  dir="auto"
                />
              </div>
              {fieldErrors.username && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.username}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                {t.password}
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: undefined })); }}
                  required
                  className={`input-premium w-full pr-10 pl-10 ${fieldErrors.password ? 'border-red-500/50 focus:border-red-500' : ''}`}
                  placeholder={t.passwordPlaceholder}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{fieldErrors.password}</p>
              )}
            </div>

            {/* Error message */}
            <AnimatePresence>
              {(error || loginError) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                >
                  {error || loginError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loginLoading}
              className="btn-premium w-full gap-2 py-3 relative overflow-hidden"
            >
              {loginLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 rounded-full border-2 border-white border-t-transparent"
                />
              ) : tab === 'login' ? (
                <><LogIn className="w-4 h-4" />{t.login}</>
              ) : (
                <><UserPlus className="w-4 h-4" />{t.register}</>
              )}
            </button>
          </motion.form>

          {/* Toggle login/register */}
          <p className="text-center text-xs text-[var(--text-muted)] mt-4">
            {tab === 'login' ? t.noAccount : t.hasAccount}{' '}
            <button
              type="button"
              onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
              className="text-teal-500 hover:text-teal-400 font-medium transition-colors"
            >
              {tab === 'login' ? t.createNow : t.loginNow}
            </button>
          </p>

          {/* Selected type indicator for register */}
          {tab === 'register' && (
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                <span>{t.typeFixed}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${accountType === 'shop' ? 'bg-teal-500/10 text-teal-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  {accountType === 'shop' ? <Store className="w-3 h-3" /> : <Pill className="w-3 h-3" />}
                  {accountType === 'shop' ? t.shop : t.pharmacy}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
export default Login;
