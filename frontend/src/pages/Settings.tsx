import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Store, Moon, Sun, Monitor, RotateCcw, Check, Save, Download, Upload, Receipt, Bell, Globe, DollarSign,
  Calendar, Shield, Printer, Info, ChevronLeft, ChevronRight, FileText, Database, Paintbrush, Megaphone,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import * as api from '../api';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } };

const SETTINGS_TABS = [
  { id: 'store', icon: Store, label: 'settings.store_info' },
  { id: 'appearance', icon: Paintbrush, label: 'settings.appearance' },
  { id: 'notifications', icon: Bell, label: 'settings.notifications' },
  { id: 'receipt', icon: Receipt, label: 'settings.receipt' },
  { id: 'tax', icon: DollarSign, label: 'settings.tax' },
  { id: 'backup', icon: Database, label: 'settings.backup' },
  { id: 'about', icon: Info, label: 'settings.about' },
];

export function Settings() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'ar';
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState('store');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');

  const [s, setS] = useState({
    store_name: '', store_address: '', store_phone: '', store_email: '', store_tax_id: '', store_logo: '',
    theme: 'system', language: 'ar', currency_symbol: 'MRU', currency_label: 'أوقية',
    date_format: 'DD/MM/YYYY', price_display: 'cost', round_prices: false,
    email_notifications: true, push_notifications: true, sms_notifications: false,
    low_stock_alert: true, expiry_alert: true, daily_report: false,
    low_stock_threshold: 10, expiry_alert_days: 30,
    tax_rate: 0, receipt_header: '', receipt_footer: 'شكراً لتعاملكم معنا',
    receipt_width: 80, auto_print: false,
  });

  useEffect(() => {
    api.settings.get().then((data: any) => {
      setS(prev => ({ ...prev, ...data }));
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.settings.update(s);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setS({
      store_name: 'مورد - MAWARED', store_address: 'نواكشوط، موريتانيا', store_phone: '+222 45 00 00 00',
      store_email: '', store_tax_id: '', store_logo: '',
      theme: 'system', language: 'ar', currency_symbol: 'MRU', currency_label: 'أوقية',
      date_format: 'DD/MM/YYYY', price_display: 'cost', round_prices: false,
      email_notifications: true, push_notifications: true, sms_notifications: false,
      low_stock_alert: true, expiry_alert: true, daily_report: false,
      low_stock_threshold: 10, expiry_alert_days: 30,
      tax_rate: 0, receipt_header: '', receipt_footer: 'شكراً لتعاملكم معنا',
      receipt_width: 80, auto_print: false,
    });
  };

  const applyTheme = (theme: string) => {
    setS(prev => ({ ...prev, theme }));
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else if (theme === 'light') root.classList.remove('dark');
    else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  };

  const applyLanguage = (language: string) => {
    setS(prev => ({ ...prev, language }));
    i18next.changeLanguage(language);
    const root = document.documentElement;
    if (language === 'ar') { root.setAttribute('dir', 'rtl'); root.setAttribute('lang', 'ar'); }
    else { root.setAttribute('dir', 'ltr'); root.setAttribute('lang', language); }
  };

  const handleExport = async () => {
    try {
      const data = await api.backup.export();
      setExportData(JSON.stringify(data, null, 2));
    } catch { setExportData('{"error": "Export failed"}'); }
  };

  const handleImport = () => {
    try {
      JSON.parse(importData);
      alert('Import functionality requires manual implementation');
    } catch { alert('Invalid JSON'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('settings.title')}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t('settings.store_info_desc')}</p>
        </div>
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

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-56 hidden lg:flex flex-col gap-1 sticky top-4 h-fit">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border border-teal-500 dark:border-teal-400'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-4 h-4" /> {t(tab.label)}
              </button>
            );
          })}
        </div>

        {/* Mobile tabs */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-2">
          {SETTINGS_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border border-teal-500 dark:border-teal-400'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t(tab.label)}
              </button>
            );
          })}
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex-1 space-y-4">
          {/* Store Info */}
          {activeTab === 'store' && (
            <motion.div variants={itemVariants} className="card-glass card-glow p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950"><Store className="w-5 h-5 text-teal-600" /></div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('settings.store_info')}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.store_name')}</label><input value={s.store_name} onChange={e => setS({ ...s, store_name: e.target.value })} className="input-premium" /></div>
                <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.phone')}</label><input value={s.store_phone} onChange={e => setS({ ...s, store_phone: e.target.value })} className="input-premium" /></div>
                <div className="sm:col-span-2"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.address')}</label><input value={s.store_address} onChange={e => setS({ ...s, store_address: e.target.value })} className="input-premium" /></div>
                <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.email')}</label><input value={s.store_email} onChange={e => setS({ ...s, store_email: e.target.value })} className="input-premium" type="email" /></div>
                <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.tax_id')}</label><input value={s.store_tax_id} onChange={e => setS({ ...s, store_tax_id: e.target.value })} className="input-premium" /></div>
              </div>
            </motion.div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <>
              <motion.div variants={itemVariants} className="card-glass card-glow p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950"><Paintbrush className="w-5 h-5 text-purple-600" /></div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('settings.appearance')}</h2>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => applyTheme('light')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${s.theme === 'light' ? 'border-teal-500 bg-teal-50 dark:bg-teal-950' : 'border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'}`}><Sun className="w-5 h-5" /><span className="text-xs">{t('settings.light')}</span></button>
                  <button onClick={() => applyTheme('dark')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${s.theme === 'dark' ? 'border-teal-500 bg-teal-50 dark:bg-teal-950' : 'border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'}`}><Moon className="w-5 h-5" /><span className="text-xs">{t('settings.dark')}</span></button>
                  <button onClick={() => applyTheme('system')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${s.theme === 'system' ? 'border-teal-500 bg-teal-50 dark:bg-teal-950' : 'border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'}`}><Monitor className="w-5 h-5" /><span className="text-xs">{t('settings.auto')}</span></button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="card-glass card-glow p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950"><Globe className="w-5 h-5 text-blue-600" /></div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('settings.language_section')}</h2>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => applyLanguage('ar')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${s.language === 'ar' ? 'border-teal-500 bg-teal-50 dark:bg-teal-950' : 'border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'}`}><span className="text-lg font-bold">🇲🇷</span><span className="text-xs">{t('settings.arabic')}</span></button>
                  <button onClick={() => applyLanguage('en')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${s.language === 'en' ? 'border-teal-500 bg-teal-50 dark:bg-teal-950' : 'border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'}`}><span className="text-lg font-bold">🇺🇸</span><span className="text-xs">{t('settings.english')}</span></button>
                  <button onClick={() => applyLanguage('fr')} className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${s.language === 'fr' ? 'border-teal-500 bg-teal-50 dark:bg-teal-950' : 'border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]'}`}><span className="text-lg font-bold">🇫🇷</span><span className="text-xs">{t('settings.french')}</span></button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="card-glass card-glow p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('settings.currency')}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.currency')}</label><input value={s.currency_symbol} onChange={e => setS({ ...s, currency_symbol: e.target.value })} className="input-premium" /></div>
                  <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.tax_rate')}</label><input type="number" value={s.tax_rate} onChange={e => setS({ ...s, tax_rate: parseFloat(e.target.value) || 0 })} className="input-premium" /></div>
                  <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.date_format')}</label><select value={s.date_format} onChange={e => setS({ ...s, date_format: e.target.value })} className="input-premium"><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select></div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="round" checked={s.round_prices} onChange={e => setS({ ...s, round_prices: e.target.checked })} className="w-4 h-4" />
                    <label htmlFor="round" className="text-sm text-[var(--text-secondary)]">{t('settings.round_prices')}</label>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <>
              <motion.div variants={itemVariants} className="card-glass card-glow p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950"><Bell className="w-5 h-5 text-amber-600" /></div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('settings.notifications')}</h2>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'email_notifications', label: 'settings.email', desc: 'settings.email_desc' },
                    { key: 'push_notifications', label: 'settings.push', desc: 'settings.push_desc' },
                    { key: 'sms_notifications', label: 'settings.sms', desc: 'settings.sms_desc' },
                    { key: 'low_stock_alert', label: 'settings.low_stock_alert', desc: 'settings.low_stock_desc' },
                    { key: 'expiry_alert', label: 'settings.expiry_alert', desc: 'settings.expiry_alert_desc' },
                    { key: 'daily_report', label: 'settings.daily_report', desc: 'settings.daily_report_desc' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{t(item.label)}</p>
                        <p className="text-xs text-[var(--text-muted)]">{t(item.desc)}</p>
                      </div>
                      <input type="checkbox" checked={(s as any)[item.key]} onChange={e => setS({ ...s, [item.key]: e.target.checked })} className="w-5 h-5 accent-teal-500" />
                    </div>
                  ))}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.low_stock_threshold')}</label><input type="number" value={s.low_stock_threshold} onChange={e => setS({ ...s, low_stock_threshold: parseInt(e.target.value) || 10 })} className="input-premium" /></div>
                    <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.expiry_alert_days')}</label><input type="number" value={s.expiry_alert_days} onChange={e => setS({ ...s, expiry_alert_days: parseInt(e.target.value) || 30 })} className="input-premium" /></div>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* Receipt */}
          {activeTab === 'receipt' && (
            <motion.div variants={itemVariants} className="card-glass card-glow p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950"><Printer className="w-5 h-5 text-orange-600" /></div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('settings.receipt')}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.receipt_header')}</label><textarea value={s.receipt_header} onChange={e => setS({ ...s, receipt_header: e.target.value })} rows={2} className="input-premium w-full" /></div>
                <div className="sm:col-span-2"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.receipt_footer')}</label><textarea value={s.receipt_footer} onChange={e => setS({ ...s, receipt_footer: e.target.value })} rows={2} className="input-premium w-full" /></div>
                <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.receipt_width')}</label><input type="number" value={s.receipt_width} onChange={e => setS({ ...s, receipt_width: parseInt(e.target.value) || 80 })} className="input-premium" /></div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="auto_print" checked={s.auto_print} onChange={e => setS({ ...s, auto_print: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="auto_print" className="text-sm text-[var(--text-secondary)]">{t('settings.auto_print')}</label>
                </div>
              </div>
              <div className="mt-4 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-dashed border-[var(--border-subtle)]">
                <p className="text-center text-xs text-[var(--text-muted)] mb-2">{t('settings.receipt_preview')}</p>
                <div className="text-center text-sm font-mono space-y-1">
                  <p className="font-bold">{s.receipt_header || s.store_name || '---'}</p>
                  <p className="text-xs">--------------------------------</p>
                  <p className="text-xs">Item 1 .......... 15.00 {s.currency_symbol}</p>
                  <p className="text-xs">--------------------------------</p>
                  <p className="font-bold">TOTAL: 15.00 {s.currency_symbol}</p>
                  <p className="text-xs">{s.receipt_footer || '---'}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tax */}
          {activeTab === 'tax' && (
            <motion.div variants={itemVariants} className="card-glass card-glow p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950"><Shield className="w-5 h-5 text-red-600" /></div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('settings.tax')}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t('settings.tax_rate')}</label><div className="flex items-center gap-2"><input type="number" value={s.tax_rate} onChange={e => setS({ ...s, tax_rate: parseFloat(e.target.value) || 0 })} className="input-premium" /><span className="text-sm">%</span></div></div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="round" checked={s.round_prices} onChange={e => setS({ ...s, round_prices: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="round" className="text-sm text-[var(--text-secondary)]">{t('settings.round_prices')}</label>
                </div>
              </div>
            </motion.div>
          )}

          {/* Backup */}
          {activeTab === 'backup' && (
            <>
              <motion.div variants={itemVariants} className="card-glass card-glow p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-950"><Download className="w-5 h-5 text-green-600" /></div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('settings.export_data')}</h2>
                </div>
                <button onClick={handleExport} className="btn-premium mb-3">
                  <Download className="w-4 h-4" /> {t('settings.export_data')}
                </button>
                {exportData && <textarea value={exportData} readOnly rows={8} className="input-premium w-full text-xs font-mono" />}
              </motion.div>
              <motion.div variants={itemVariants} className="card-glass card-glow p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950"><Upload className="w-5 h-5 text-blue-600" /></div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t('settings.restore')}</h2>
                </div>
                <textarea value={importData} onChange={e => setImportData(e.target.value)} rows={6} placeholder="Paste JSON data here..." className="input-premium w-full text-xs font-mono mb-3" />
                <button onClick={handleImport} className="btn-secondary">
                  <Upload className="w-4 h-4" /> {t('settings.restore')}
                </button>
              </motion.div>
            </>
          )}

          {/* About */}
          {activeTab === 'about' && (
            <motion.div variants={itemVariants} className="card-glass card-glow p-6 rounded-xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white text-2xl font-bold">م</span>
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">MAWARED</h2>
              <p className="text-sm text-[var(--text-muted)] mb-4">{t('settings.version')}: 3.0.0</p>
              <p className="text-sm text-[var(--text-muted)] mb-2">نظام إدارة المحلات والصيدليات الذكي</p>
              <p className="text-sm text-[var(--text-muted)]">تم تطويره بواسطة Medzobro</p>
              <div className="mt-6 p-4 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-subtle)]">
                <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{t('settings.support')}</p>
                <p className="text-xs text-[var(--text-muted)]">Email: medzobro@gmail.com</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Settings;
