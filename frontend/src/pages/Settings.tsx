import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Store, Moon, Sun, RotateCcw, Check, Monitor, Save,
  Bell, Globe, DollarSign, Languages,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import * as api from '../api';
import { useAppStore } from '../stores/appStore';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } };

const CURRENCIES = [
  { symbol: 'MRU', label: 'أوقية موريتانية', label_en: 'Mauritanian Ouguiya' },
  { symbol: 'USD', label: 'دولار أمريكي', label_en: 'US Dollar' },
  { symbol: 'EUR', label: 'يورو', label_en: 'Euro' },
  { symbol: 'GBP', label: 'جنيه إسترليني', label_en: 'British Pound' },
  { symbol: 'SAR', label: 'ريال سعودي', label_en: 'Saudi Riyal' },
  { symbol: 'AED', label: 'درهم إماراتي', label_en: 'UAE Dirham' },
  { symbol: 'QAR', label: 'ريال قطري', label_en: 'Qatari Riyal' },
  { symbol: 'KWD', label: 'دينار كويتي', label_en: 'Kuwaiti Dinar' },
  { symbol: 'MAD', label: 'درهم مغربي', label_en: 'Moroccan Dirham' },
  { symbol: 'TND', label: 'دينار تونسي', label_en: 'Tunisian Dinar' },
  { symbol: 'EGP', label: 'جنيه مصري', label_en: 'Egyptian Pound' },
  { symbol: 'LYD', label: 'دينار ليبي', label_en: 'Libyan Dinar' },
];

export function Settings() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'ar';
  const isAr = lang === 'ar';
  const setLanguage = useAppStore((s) => s.setLanguage);

  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [theme, setTheme] = useState('system');
  const [language, setLang] = useState('ar');
  const [currencySymbol, setCurrencySymbol] = useState('MRU');
  const [currencyLabel, setCurrencyLabel] = useState('أوقية');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [expiryAlert, setExpiryAlert] = useState(true);
  const [dailyReport, setDailyReport] = useState(false);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.settings.get().then((s: any) => {
      const loadedLang = s.language || 'ar';
      const loadedTheme = s.theme || 'system';
      const loadedSymbol = s.currency_symbol || 'MRU';
      setStoreName(s.store_name || '');
      setStoreAddress(s.store_address || '');
      setStorePhone(s.store_phone || '');
      setTheme(loadedTheme);
      setLang(loadedLang);
      setCurrencySymbol(loadedSymbol);
      const cur = CURRENCIES.find((c) => c.symbol === loadedSymbol);
      setCurrencyLabel(cur ? (loadedLang === 'ar' ? cur.label : cur.label_en) : (loadedLang === 'ar' ? 'أوقية' : 'Ouguiya'));
      setEmailNotifications(!!s.email_notifications);
      setPushNotifications(!!s.push_notifications);
      setSmsNotifications(!!s.sms_notifications);
      setLowStockAlert(!!s.low_stock_alert);
      setExpiryAlert(!!s.expiry_alert);
      setDailyReport(!!s.daily_report);
      // Apply immediately on load
      applyTheme(loadedTheme);
      if (loadedLang !== i18n.language) {
        i18n.changeLanguage(loadedLang);
        setLanguage(loadedLang as any);
        document.documentElement.setAttribute('dir', loadedLang === 'ar' ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', loadedLang);
      }
      setLoading(false);
    }).catch(() => {
      setStoreName('مورد - MAWARED');
      setStoreAddress('نواكشوط، موريتانيا');
      setStorePhone('+222 45 00 00 00');
      setTheme('system');
      setLang('ar');
      setCurrencySymbol('MRU');
      setCurrencyLabel('أوقية');
      setEmailNotifications(true);
      setPushNotifications(true);
      setSmsNotifications(false);
      setLowStockAlert(true);
      setExpiryAlert(true);
      setDailyReport(false);
      applyTheme('system');
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await api.settings.update({
      store_name: storeName,
      store_address: storeAddress,
      store_phone: storePhone,
      theme,
      language,
      currency_symbol: currencySymbol,
      currency_label: currencyLabel,
      email_notifications: emailNotifications,
      push_notifications: pushNotifications,
      sms_notifications: smsNotifications,
      low_stock_alert: lowStockAlert,
      expiry_alert: expiryAlert,
      daily_report: dailyReport,
    });
    // Apply language immediately
    if (language !== i18n.language) {
      i18n.changeLanguage(language);
      setLanguage(language as any);
      document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
      document.documentElement.setAttribute('lang', language);
    }
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setStoreName('مورد - MAWARED');
    setStoreAddress('نواكشوط، موريتانيا');
    setStorePhone('+222 45 00 00 00');
    setTheme('system');
    setLang('ar');
    setCurrencySymbol('MRU');
    setCurrencyLabel('أوقية');
    setEmailNotifications(true);
    setPushNotifications(true);
    setSmsNotifications(false);
    setLowStockAlert(true);
    setExpiryAlert(true);
    setDailyReport(false);
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

  const handleCurrencyChange = (symbol: string) => {
    setCurrencySymbol(symbol);
    const cur = CURRENCIES.find((c) => c.symbol === symbol);
    if (cur) setCurrencyLabel(language === 'ar' ? cur.label : cur.label_en);
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
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleReset} className="btn-secondary text-sm px-4 py-2.5 flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />{t('common.reset')}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} className="btn-premium text-sm px-4 py-2.5 flex items-center gap-2">
            {saved ? (
              <><Check className="w-4 h-4" />{t('settings.saved')}</>
            ) : (
              <><Save className="w-4 h-4" />{saving ? '...' : t('settings.save_changes')}</>
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
              <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="input-premium" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.address')}</label>
              <input value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} className="input-premium" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.phone')}</label>
              <input value={storePhone} onChange={(e) => setStorePhone(e.target.value)} className="input-premium" />
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
            <button onClick={() => applyTheme('light')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${theme === 'light' ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'}`}>
              <Sun className="w-5 h-5" />
              <span className="text-xs">{t('settings.light')}</span>
            </button>
            <button onClick={() => applyTheme('dark')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${theme === 'dark' ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'}`}>
              <Moon className="w-5 h-5" />
              <span className="text-xs">{t('settings.dark')}</span>
            </button>
            <button onClick={() => applyTheme('system')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${theme === 'system' ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'}`}>
              <Monitor className="w-5 h-5" />
              <span className="text-xs">{t('settings.auto')}</span>
            </button>
          </div>
        </motion.div>

        {/* Language Card */}
        <motion.div variants={itemVariants} className="card-glass card-glow p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-[var(--accent-soft)]"><Languages className="w-5 h-5 text-[var(--accent)]" /></div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('settings.language_section')}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t('settings.language_desc')}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['ar', 'en', 'fr'] as const).map((lng) => (
              <button
                key={lng}
                onClick={() => setLang(lng)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${language === lng ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'}`}
              >
                <Globe className="w-5 h-5" />
                <span className="text-xs font-medium">{lng === 'ar' ? t('settings.arabic') : lng === 'en' ? t('settings.english') : t('settings.french')}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Currency Card */}
        <motion.div variants={itemVariants} className="card-glass card-glow p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-[var(--accent-soft)]"><DollarSign className="w-5 h-5 text-[var(--accent)]" /></div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('currency.label')}</h2>
              <p className="text-sm text-[var(--text-muted)]">{isAr ? 'اختر العملة الافتراضية للنظام' : 'Select the default system currency'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto no-scrollbar">
            {CURRENCIES.map((cur) => (
              <button
                key={cur.symbol}
                onClick={() => handleCurrencyChange(cur.symbol)}
                className={`p-2.5 rounded-xl border text-left transition-all ${currencySymbol === cur.symbol ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'}`}
              >
                <div className="text-xs font-bold text-[var(--text-primary)]">{cur.symbol}</div>
                <div className="text-[10px] text-[var(--text-muted)] truncate">{isAr ? cur.label : cur.label_en}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Notifications Card */}
        <motion.div variants={itemVariants} className="card-glass card-glow p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-[var(--accent-soft)]"><Bell className="w-5 h-5 text-[var(--accent)]" /></div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('settings.notifications')}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t('settings.notifications_desc')}</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { key: 'email', label: t('settings.email'), desc: t('settings.email_desc'), value: emailNotifications, setter: setEmailNotifications },
              { key: 'push', label: t('settings.push'), desc: t('settings.push_desc'), value: pushNotifications, setter: setPushNotifications },
              { key: 'sms', label: t('settings.sms'), desc: t('settings.sms_desc'), value: smsNotifications, setter: setSmsNotifications },
              { key: 'low_stock', label: t('settings.low_stock_alert'), desc: t('settings.low_stock_desc'), value: lowStockAlert, setter: setLowStockAlert },
              { key: 'expiry', label: t('settings.expiry_alert'), desc: t('settings.expiry_alert_desc'), value: expiryAlert, setter: setExpiryAlert },
              { key: 'daily', label: t('settings.daily_report'), desc: t('settings.daily_report_desc'), value: dailyReport, setter: setDailyReport },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors">
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">{item.label}</div>
                  <div className="text-xs text-[var(--text-muted)]">{item.desc}</div>
                </div>
                <button
                  onClick={() => item.setter(!item.value)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${item.value ? 'bg-[var(--accent)]' : 'bg-[var(--border-subtle)]'}`}
                >
                  <motion.div
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                    animate={{ left: item.value ? '22px' : '4px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
