import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  Moon,
  Sun,
  Bell,
  Languages,
  Download,
  Database,
  Smartphone,
  Mail,
  Volume2,
  Save,
  RotateCcw,
  Check,
  Monitor,
  Palette,
  Package,
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export function Settings() {
  const { theme, setTheme } = useAppStore();
  const [storeName, setStoreName] = useState('مورد - MAWARED');
  const [storeAddress, setStoreAddress] = useState('الرياض، المملكة العربية السعودية');
  const [storePhone, setStorePhone] = useState('+966 50 123 4567');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [lowStockAlert, setLowStockAlert] = useState(true);
  const [expiryAlert, setExpiryAlert] = useState(true);
  const [dailyReport, setDailyReport] = useState(false);
  const [language, setLanguage] = useState<'ar'>('ar');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setStoreName('مورد - MAWARED');
    setStoreAddress('الرياض، المملكة العربية السعودية');
    setStorePhone('+966 50 123 4567');
    setEmailNotifications(true);
    setPushNotifications(true);
    setSmsNotifications(false);
    setLowStockAlert(true);
    setExpiryAlert(true);
    setDailyReport(false);
    setLanguage('ar');
    setTheme('system');
  };

  const currentThemeLabel =
    theme === 'light' ? 'فاتح' : theme === 'dark' ? 'غامق' : 'تلقائي';

  return (
    <div dir="rtl" className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            <span className="text-gradient">الإعدادات</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            إدارة إعدادات المتجر والتفضيلات
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleReset}
            className="btn-secondary text-sm gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">إعادة تعيين</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="btn-premium text-sm gap-1.5"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>تم الحفظ</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>حفظ التغييرات</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Store Information */}
        <motion.div variants={itemVariants} className="card-glass card-glow rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center">
              <Store className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                معلومات المتجر
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                البيانات الأساسية للمتجر
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                اسم المتجر
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="input-premium"
                placeholder="أدخل اسم المتجر"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                العنوان
              </label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="input-premium"
                placeholder="أدخل عنوان المتجر"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="input-premium"
                placeholder="أدخل رقم الهاتف"
              />
            </div>
          </div>
        </motion.div>

        {/* Appearance / Theme */}
        <motion.div variants={itemVariants} className="card-glass card-glow rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
              <Palette className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                المظهر
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                تخصيص ألوان وواجهة التطبيق
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              الوضع الحالي: <span className="text-[var(--text-primary)]">{currentThemeLabel}</span>
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  theme === 'light'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950 shadow-sm'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
                }`}
              >
                <Sun className="w-6 h-6 text-amber-500" />
                <span className="text-xs font-medium">فاتح</span>
                {theme === 'light' && (
                  <motion.span
                    layoutId="theme-check"
                    className="w-2 h-2 rounded-full bg-teal-500"
                  />
                )}
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  theme === 'dark'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950 shadow-sm'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
                }`}
              >
                <Moon className="w-6 h-6 text-indigo-500" />
                <span className="text-xs font-medium">غامق</span>
                {theme === 'dark' && (
                  <motion.span
                    layoutId="theme-check"
                    className="w-2 h-2 rounded-full bg-teal-500"
                  />
                )}
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  theme === 'system'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950 shadow-sm'
                    : 'border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
                }`}
              >
                <Monitor className="w-6 h-6 text-zinc-500" />
                <span className="text-xs font-medium">تلقائي</span>
                {theme === 'system' && (
                  <motion.span
                    layoutId="theme-check"
                    className="w-2 h-2 rounded-full bg-teal-500"
                  />
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={itemVariants} className="card-glass card-glow rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                الإشعارات
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                تفعيل القنوات والتنبيهات
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <ToggleRow
              icon={<Mail className="w-4 h-4" />}
              label="البريد الإلكتروني"
              desc="إرسال تنبيهات عبر البريد"
              checked={emailNotifications}
              onChange={setEmailNotifications}
            />
            <ToggleRow
              icon={<Smartphone className="w-4 h-4" />}
              label="الإشعارات الفورية"
              desc="إشعارات داخل التطبيق"
              checked={pushNotifications}
              onChange={setPushNotifications}
            />
            <ToggleRow
              icon={<Volume2 className="w-4 h-4" />}
              label="الرسائل النصية"
              desc="إرسال تنبيهات عبر SMS"
              checked={smsNotifications}
              onChange={setSmsNotifications}
            />
            <div className="h-px bg-[var(--border-subtle)] my-2" />
            <ToggleRow
              icon={<Package className="w-4 h-4" />}
              label="تنبيه المخزون المنخفض"
              desc="عند وصول منتج للحد الأدنى"
              checked={lowStockAlert}
              onChange={setLowStockAlert}
            />
            <ToggleRow
              icon={<RotateCcw className="w-4 h-4" />}
              label="تنبيه انتهاء الصلاحية"
              desc="قبل انتهاء صلاحية المنتجات"
              checked={expiryAlert}
              onChange={setExpiryAlert}
            />
            <ToggleRow
              icon={<Sun className="w-4 h-4" />}
              label="التقرير اليومي"
              desc="تلخيص يومي للمبيعات"
              checked={dailyReport}
              onChange={setDailyReport}
            />
          </div>
        </motion.div>

        {/* Language */}
        <motion.div variants={itemVariants} className="card-glass card-glow rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
              <Languages className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                اللغة
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                لغة عرض واجهة التطبيق
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setLanguage('ar')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                language === 'ar'
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40'
                  : 'border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center text-lg font-bold text-[var(--text-primary)]">
                ع
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-[var(--text-primary)]">العربية</p>
                <p className="text-xs text-[var(--text-muted)]">اللغة الافتراضية</p>
              </div>
              {language === 'ar' && (
                <motion.div layoutId="lang-check" className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </button>
          </div>
        </motion.div>

        {/* Backup / Export */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 card-glass card-glow rounded-2xl p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
              <Database className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                النسخ الاحتياطي والتصدير
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                حفظ واستعادة بيانات المتجر
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-colors text-right"
            >
              <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center">
                <Download className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  تصدير البيانات
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  JSON / CSV / Excel
                </p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-colors text-right"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  نسخ احتياطي
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  إنشاء نسخة كاملة
                </p>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-colors text-right"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  استعادة
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  استرجاع من نسخة
                </p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  desc,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)]">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
          <p className="text-xs text-[var(--text-muted)]">{desc}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-teal-500' : 'bg-zinc-300 dark:bg-zinc-600'
        }`}
      >
        <motion.div
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
        />
      </button>
    </div>
  );
}
