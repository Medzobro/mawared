import { useState, useEffect } from 'react';
import {
  Store, Moon, Sun, Bell, Languages, Download, Database,
  Smartphone, Mail, Volume2, Save, RotateCcw, Check, Monitor
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import * as api from '../api';
import { motion } from 'framer-motion';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } };

const LANG_MAP: Record<any, any> = {
  ar: { label: 'العربية', flag: '🇸🇦', desc: 'اللغة الافتراضية' },
  en: { label: 'English', flag: '🇬🇧', desc: 'English interface' },
  fr: { label: 'Français', flag: '🇫🇷', desc: 'Interface en français' },
};

export function Settings() {
  const { t } = useTranslation();
  const { theme, setTheme, language, setLanguage } = useAppStore();

  const [storeName, setStoreName] = useState('مورد - MAWARED');
  const [storeAddress, setStoreAddress] = useState('نواكشوط، موريتانيا');
  const [storePhone, setStorePhone] = useState('+222 45 00 00 00');
  const [settings, setSettings] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.settings.get().then(s => {
      setSettings(s);
      setStoreName(s.store_name);
      setStoreAddress(s.store_address);
      setStorePhone(s.store_phone);
      if (s.theme) setTheme(s.theme as any);
      if (s.language) setLanguage(s.language as any);
      i18next.changeLanguage(s.language || 'ar');
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await api.settings.update({
      store_name: storeName, store_address: storeAddress, store_phone: storePhone,
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

  const currentThemeLabel = theme === 'light' ? t('settings.light') : theme === 'dark' ? t('settings.dark') : t('settings.auto');

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">{t('settings.title')}</h1><p className="text-sm text-[var(--text-muted)]">{t('settings.store_info_desc')}</p></div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleReset} className="btn-secondary text-sm px-4 py-2.5">
            <RotateCcw className="w-4 h-4" />{t('common.reset')}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="btn-premium text-sm px-4 py-2.5">
            {saved ? (
              <><Check className="w-4 h-4" />{t('settings.saved')}</>
            ) : (
              <><Save className="w-4 h-4" />{saving ? '...' : t('settings.save_changes')}</>
            )}
          </motion.button>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="card-glass card-glow p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-[var(--accent-soft)]"><Store className="w-5 h-5 text-[var(--accent)]" /></div>
            <div><h2 className="text-lg font-semibold">{t('settings.store_info')}</h2><p className="text-sm text-[var(--text-muted)]">{t('settings.store_name_desc')}</p></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.store_name')}</label>
              <input value={storeName} onChange={e=>setStoreName(e.target.value)} className="input-premium" />
            </div>
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.address')}</label>
              <input value={storeAddress} onChange={e=>setStoreAddress(e.target.value)} className="input-premium" />
            </div>
            <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.phone')}</label>
              <input value={storePhone} onChange={e=>setStorePhone(e.target.value)} className="input-premium" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card-glass card-glow p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-[var(--accent-soft)]"><Monitor className="w-5 h-5 text-[var(--accent)]" /></div>
            <div><h2 className="text-lg font-semibold">{t('settings.appearance')}</h2><p className="text-sm text-[var(--text-muted)]">{t('settings.store_name_desc')}</p></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['light','dark','system'] as any[]).map((t) => (
              <button key={t} onClick={()=>setTheme(t as any)} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${theme===t?'border-[var(--accent)] bg-[var(--accent-soft)]':'border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'}`}>
                {t==='light'?<Sun className="w-5 h-5" />:t==='dark'?<Moon className="w-5 h-5" />:<Monitor className="w-5 h-5" />}
                <span className="text-xs">{t==='light'?t('settings.light'):t==='dark'?t('settings.dark'):t('settings.auto')}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
