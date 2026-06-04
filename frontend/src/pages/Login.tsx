import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../stores/appStore';
import { Store, Pill, ShieldCheck, Lock, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { loginApi, registerApi, loginLoading, loginError, setMode } = useAppStore();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [accountType, setAccountType] = useState<'shop' | 'pharmacy'>('shop');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError(tab === 'login' ? 'أدخل اسم المستخدم وكلمة المرور' : 'أكمل جميع الحقول');
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
      setError(e.message || 'فشل تسجيل الدخول');
    }
  };

  const handleSelectAccountType = async (type: 'shop' | 'pharmacy') => {
    setAccountType(type);
    setMode(type);
    try {
      await registerApi(username, password, type);
      navigate('/dashboard', { replace: true });
    } catch (e: any) {
      setError(e.message || 'فشل التسجيل');
    }
  };

  const reset = () => {
    setUsername('');
    setPassword('');
    setError('');
    setStep(1);
  };

  const switchTab = (t: 'login' | 'register') => {
    setTab(t);
    reset();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden" dir="rtl">
      <div className="absolute inset-0 mesh-gradient bg-[var(--bg-primary)]" />
      <motion.div className="absolute rounded-full opacity-20" style={{ width:400, height:400, background:'radial-gradient(circle, rgba(20,184,166,0.35) 0%, transparent 70%)', top:'10%', left:'-5%' }} animate={{ x:[0,40,-20,0], y:[0,-30,20,0] }} transition={{ duration:18, repeat:Infinity, ease:'easeInOut' }} />
      <motion.div className="absolute rounded-full opacity-15" style={{ width:320, height:320, background:'radial-gradient(circle, rgba(15,118,110,0.4) 0%, transparent 70%)', bottom:'5%', right:'-5%' }} animate={{ x:[0,-30,50,0], y:[0,20,-40,0] }} transition={{ duration:22, repeat:Infinity, ease:'easeInOut' }} />

      <motion.div initial={{ opacity:0, scale:0.92, y:20 }} animate={{ opacity:1, scale:1, y:0 }} transition={{ duration:0.6, ease:'easeOut' }} className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-3xl p-8 sm:p-10" style={{ background:'rgba(255,255,255,0.03)', backdropFilter:'blur(40px) saturate(1.4)', WebkitBackdropFilter:'blur(40px) saturate(1.4)', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 32px 64px -12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
          <div className="flex flex-col items-center text-center mb-8">
            <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:0.2, type:'spring', stiffness:200 }} className="w-16 h-16 mb-5 rounded-2xl flex items-center justify-center" style={{ background:'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(15,118,110,0.3))', border:'1px solid rgba(20,184,166,0.2)' }}>
              <Store className="w-8 h-8 text-teal-400" />
            </motion.div>
            <motion.h1 initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="text-2xl font-bold text-[var(--text-primary)] mb-1">مـورد</motion.h1>
            <motion.p initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }} className="text-sm text-[var(--text-muted)]">نظام إدارة المحلات والصيدليات الذكي</motion.p>
          </div>

          <div className="flex rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-1 mb-6">
            <button onClick={()=>switchTab('login')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab==='login'?'bg-[var(--accent)] text-white shadow-md':'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              <LogIn className="w-4 h-4" /> دخول
            </button>
            <button onClick={()=>switchTab('register')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${tab==='register'?'bg-[var(--accent)] text-white shadow-md':'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              <UserPlus className="w-4 h-4" /> حساب جديد
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step===1 ? (
              <motion.form key="step1" onSubmit={handleLogin} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">اسم المستخدم</label>
                  <div className="relative">
                    <Store className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input type="text" value={username} onChange={e=>setUsername(e.target.value)} required className="input-premium w-full pr-10" placeholder="أدخل اسم المستخدم" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} required className="input-premium w-full pr-10 pl-10" placeholder="••••••" />
                    <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                      {showPassword?<EyeOff className="w-4 h-4" />:<Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {(error||loginError) && (
                    <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error||loginError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button type="submit" disabled={loginLoading} className="btn-premium w-full gap-2 py-3">
                  {loginLoading?(
                    <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:'linear' }} className="w-5 h-5 rounded-full border-2 border-white border-t-transparent" />
                  ):tab==='login'?(
                    <><LogIn className="w-4 h-4" /> تسجيل الدخول</>
                  ):(
                    <><ShieldCheck className="w-4 h-4" /> إنشاء حساب</>
                  )}
                </button>

                {tab==='login' && (
                  <p className="text-center text-xs text-[var(--text-muted)]">
                    لا تمتلك حساباً؟{' '}
                    <button type="button" onClick={()=>switchTab('register')} className="text-teal-500 hover:underline">سجل الآن</button>
                  </p>
                )}
              </motion.form>
            ) : (
              <motion.div key="step2" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} className="space-y-4">
                <p className="text-sm text-[var(--text-secondary)] text-center">اختر نوع الحساب المناسب لك</p>
                <button onClick={()=>handleSelectAccountType('shop')} className="w-full p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-right"><p className="text-sm font-semibold">محل تجاري</p><p className="text-xs text-[var(--text-muted)]">إدارة المنتجات والمخزون</p></div>
                  </div>
                </button>
                <button onClick={()=>handleSelectAccountType('pharmacy')} className="w-full p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                      <Pill className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-right"><p className="text-sm font-semibold">صيدلية</p><p className="text-xs text-[var(--text-muted)]">إدارة الأدوية والوصفات</p></div>
                  </div>
                </button>
                <button onClick={()=>setStep(1)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] w-full text-center py-2">العودة للخلف</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
