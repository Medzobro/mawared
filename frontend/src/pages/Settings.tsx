import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Moon, Sun, RotateCcw, Check, Monitor, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import * as api from '../api';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } };

export function Settings() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'ar';
  const isAr = lang === 'ar';

  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [theme, setTheme] = useState('system');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.settings.get().then((s: any) => {
      setStoreName(s.store_name || '');
      setStoreAddress(s.store_address || '');
      setStorePhone(s.store_phone || '');
      setTheme(s.theme || 'system');
      setLoading(false);
    }).catch(() => {
      setStoreName('مورد - MAWARED');
      setStoreAddress('نواكشوط، موريتانيا');
      setStorePhone('+222 45 00 00 00');
      setTheme('system');
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await api.settings.update({
      store_name: storeName, store_address: storeAddress, store_phone: storePhone, theme,
    });
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setStoreName('مورد - MAWARED');
    setStoreAddress('نواكشوط، موريتانيا');
    setStorePhone('+222 45 00 00 00');
    setTheme('system');
  };

  const applyTheme = (t: string) => {
    setTheme(t);
    const root = document.documentElement;
    if (t === 'dark') root.classList.add('dark');
    else if (t === 'light') root.classList.remove('dark');
    else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent" />
    </div>
  );

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('settings.title')}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t('settings.store_info_desc')}</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleReset} className="btn-secondary text-sm px-4 py-2.5">
            <RotateCcw className="w-4 h-4" />{t('common.reset') || 'Reset'}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="btn-premium text-sm px-4 py-2.5">
            {saved ? (
              <><Check className="w-4 h-4" />{t('settings.saved') || 'Saved'}</>
            ) : (
              <><Save className="w-4 h-4" />{saving ? '...' : (t('settings.save_changes') || 'Save Changes')}</>
            )}
          </motion.button>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Info Card */}
        <motion.div variants={itemVariants} className="card-glass card-glow p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-[var(--accent-soft)]"><Store className="w-5 h-5 text-[var(--accent)]" /></div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('settings.store_info')}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t('settings.store_name_desc')}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.store_name')}</label>
              <input value={storeName} onChange={e=>setStoreName(e.target.value)} className="input-premium" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.address')}</label>
              <input value={storeAddress} onChange={e=>setStoreAddress(e.target.value)} className="input-premium" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.phone')}</label>
              <input value={storePhone} onChange={e=>setStorePhone(e.target.value)} className="input-premium" />
            </div>
          </div>
        </motion.div>

        {/* Appearance Card */}
        <motion.div variants={itemVariants} className="card-glass card-glow p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-[var(--accent-soft)]"><Monitor className="w-5 h-5 text-[var(--accent)]" /></div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('settings.appearance')}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t('settings.appearance_desc')}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {<>
            <button onClick={()=>applyTheme('light')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${theme==='light'?'border-[var(--accent)] bg-[var(--accent-soft)]':'border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'}`}>
              <Sun className="w-5 h-5" />
              <span className="text-xs">{t('settings.light')}</span>
            </button>
            <button onClick={()=>applyTheme('dark')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${theme==='dark'?'border-[var(--accent)] bg-[var(--accent-soft)]':'border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'}`}>
              <Moon className="w-5 h-5" />
              <span className="text-xs">{t('settings.dark')}</span>
            </button>
            <button onClick={()=>applyTheme('system')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${theme==='system'?'border-[var(--accent)] bg-[var(--accent-soft)]':'border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'}`}>
              <Monitor className="w-5 h-5" />
              <span className="text-xs">{t('settings.auto')}</span>
            </button>
            </>}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
