import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Store, Moon, Sun, Bell, Languages, Download, Database,
  Smartphone, Mail, Volume2, Save, RotateCcw, Check, Monitor
} from 'lucide-react';
import { useAppStore, type Language } from '../stores/appStore';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const LANG_MAP: Record<Language, { label: string; flag: string; desc: string }> = {
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
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [expiryAlert, setExpiryAlert] = useState(true);
  const [dailyReport, setDailyReport] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (language) {
      i18next.changeLanguage(language);
      const root = document.documentElement;
      if (language === 'ar') {
        root.setAttribute('dir', 'rtl');
        root.setAttribute('lang', 'ar');
      } else {
        root.setAttribute('dir', 'ltr');
        root.setAttribute('lang', language);
      }
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    i18next.changeLanguage(lang);
    const root = document.documentElement;
    if (lang === 'ar') {
      root.setAttribute('dir', 'rtl');
      root.setAttribute('lang', 'ar');
    } else {
      root.setAttribute('dir', 'ltr');
      root.setAttribute('lang', lang);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setStoreName('مورد - MAWARED');
    setStoreAddress('نواكشوط، موريتانيا');
    setStorePhone('+222 45 00 00 00');
    setEmailNotifications(true);
    setPushNotifications(true);
    setSmsNotifications(false);
    setLowStockAlert(true);
    setExpiryAlert(true);
    setDailyReport(false);
    setTheme('system');
  };

  const currentThemeLabel = theme === 'light' ? t('settings.light') : theme === 'dark' ? t('settings.dark') : t('settings.auto');

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            <span className="text-gradient">{t('settings.title')}</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{t('settings.store_info_desc')}</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="btn-secondary text-sm px-4 py-2.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('common.reset')}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="btn-premium text-sm px-4 py-2.5"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>{t('settings.saved')}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t('settings.save_changes')}</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Store Info Card */}
        <motion.div variants={itemVariants} className="card-glass card-glow p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-[var(--accent-soft)]">
              <Store className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('settings.store_info')}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t('settings.store_name_desc')}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">{t('settings.store_name')}</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="input-premium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">{t('settings.address')}</label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="input-premium"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">{t('settings.phone')}</label>
              <input
                type="text"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="input-premium"
              />
            </div>
          </div>
        </motion.div>

        {/* Appearance Card */}
        <motion.div variants={itemVariants} className="card-glass card-glow p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-[var(--accent-soft)]">
              <Sun className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('settings.appearance')}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t('settings.appearance_desc')}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-[var(--text-secondary)] mb-2">{t('settings.current_mode')}: <span className="text-[var(--text-primary)] font-medium">{currentThemeLabel}</span></div>
            <div className="flex gap-2">
              {([
                { key: 'light', icon: Sun, label: t('settings.light') },
                { key: 'dark', icon: Moon, label: t('settings.dark') },
                { key: 'system', icon: Monitor, label: t('settings.auto') },
              ] as const).map(({ key, icon: Icon, label }) => (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTheme(key as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all duration-300 text-sm font-medium ${
                    theme === key
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] glow-sm'
                      : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Notifications Card */}
        <motion.div variants={itemVariants} className="card-glass card-glow p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-[var(--accent-soft)]">
              <Bell className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('settings.notifications')}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t('settings.notifications_desc')}</p>
            </div>
          </div>
          <div className="space-y-4">
            {[ 
              { label: t('settings.email'), desc: t('settings.email_desc'), state: emailNotifications, set: setEmailNotifications, icon: Mail },
              { label: t('settings.push'), desc: t('settings.push_desc'), state: pushNotifications, set: setPushNotifications, icon: Volume2 },
              { label: t('settings.sms'), desc: t('settings.sms_desc'), state: smsNotifications, set: setSmsNotifications, icon: Smartphone },
              { label: t('settings.low_stock_alert'), desc: t('settings.low_stock_desc'), state: lowStockAlert, set: setLowStockAlert, icon: Database },
              { label: t('settings.expiry_alert'), desc: t('settings.expiry_alert_desc'), state: expiryAlert, set: setExpiryAlert, icon: Bell },
              { label: t('settings.daily_report'), desc: t('settings.daily_report_desc'), state: dailyReport, set: setDailyReport, icon: Save },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-[var(--text-muted)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => item.set(!item.state)}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                    item.state ? 'bg-[var(--accent)]' : 'bg-[var(--border-medium)]'
                  }`}
                >
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                      item.state ? (language === 'ar' ? 'left-0.5' : 'right-0.5') : (language === 'ar' ? 'right-0.5' : 'left-0.5')
                    }`}
                    style={item.state
                      ? (language === 'ar' ? { left: '2px', right: 'auto' } : { right: '2px', left: 'auto' })
                      : (language === 'ar' ? { right: '2px', left: 'auto' } : { left: '2px', right: 'auto' })
                    }
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Language Card */}
        <motion.div variants={itemVariants} className="card-glass card-glow p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-[var(--accent-soft)]">
              <Languages className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('settings.language')}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t('settings.language_desc')}</p>
            </div>
          </div>
          <div className="space-y-3">
            {(Object.keys(LANG_MAP) as Language[]).map((lang) => {
              const info = LANG_MAP[lang];
              const isActive = language === lang;
              return (
                <motion.button
                  key={lang}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleLanguageChange(lang)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                    isActive
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] glow-sm'
                      : 'border-[var(--border-subtle)] hover:border-[var(--accent)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.flag}</span>
                    <div className="text-left">
                      <p className={`text-sm font-medium ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                        {info.label}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">{info.desc}</p>
                    </div>
                  </div>
                  {isActive ? (
                    <motion.div layoutId="lang-check" className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </motion.div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-[var(--border-medium)]" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Export/Backup Card */}
        <motion.div variants={itemVariants} className="card-glass card-glow p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-[var(--accent-soft)]">
              <Download className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('settings.backup')}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t('settings.backup_desc_full')}</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: t('settings.export_data'), desc: t('settings.export_desc'), icon: Download },
              { label: t('settings.backup_restore'), desc: t('settings.backup_desc'), icon: Database },
              { label: t('settings.restore'), desc: t('settings.restore_desc'), icon: Save },
            ].map((item) => (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{item.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center group-hover:bg-[var(--accent-soft)] transition-colors">
                  <Download className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
