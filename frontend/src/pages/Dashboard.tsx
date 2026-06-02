import { motion } from 'framer-motion';
import {
  Package,
  DollarSign,
  Receipt,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  ArrowUpLeft,
  ArrowDownRight,
  RotateCcw,
  SlidersHorizontal,
  Pill,
  Sun,
  Sparkles,
  Wind,
  Flame,
  Droplets,
  CupSoda,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { KPICard } from '../components/KPICard';
import {
  dashboardKPIS,
  weeklySales,
  categoryDistribution,
  transactions,
  alerts,
} from '../data/demoData';
import { toArabicNumerals } from '../i18n/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const categoryIconMap: Record<string, React.ElementType> = {
  'مسكنات الألم': Pill,
  'مضادات حيوية': ShieldCheck,
  فيتامينات: Sun,
  'مضادات الهيستامين': Wind,
  'عناية شخصية': Sparkles,
  'هضم ومعدة': Flame,
  'عناية بالبشرة': Droplets,
  'مياه ومشروبات': CupSoda,
};

function getCategoryIcon(name: string) {
  return categoryIconMap[name] || SlidersHorizontal;
}

function getAlertColor(severity: 'low' | 'medium' | 'high') {
  if (severity === 'high') return 'text-red-500 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900';
  if (severity === 'medium') return 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900';
  return 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900';
}

function getTransactionIcon(type: string) {
  switch (type) {
    case 'sale':
      return ArrowUpLeft;
    case 'purchase':
      return ArrowDownRight;
    case 'return':
      return RotateCcw;
    default:
      return SlidersHorizontal;
  }
}

function getTransactionColor(type: string) {
  switch (type) {
    case 'sale':
      return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
    case 'purchase':
      return 'text-blue-500 bg-blue-50 dark:bg-blue-950/40';
    case 'return':
      return 'text-amber-500 bg-amber-50 dark:bg-amber-950/40';
    default:
      return 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800';
  }
}

function formatDate(dateStr: string, locale: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function Dashboard() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'ar';
  const locale = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US';
  const isAr = lang === 'ar';
  const fmtNum = (n: number) => (isAr ? toArabicNumerals(n) : n.toLocaleString(locale));
  const curr = t('currency.symbol');

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            <span className="text-gradient">{t('dashboard.title')}</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{t('dashboard.sales_analysis')}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)]">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t('dashboard.last_update')}: {formatDate(new Date().toISOString(), locale)}</span>
        </div>
      </motion.div>

      {/* KPIs Row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <KPICard
            title={t('dashboard.total_products')}
            value={dashboardKPIS.activeProducts.value}
            change={dashboardKPIS.activeProducts.change}
            icon={Package}
            iconColor="text-teal-600"
            iconBgColor="bg-teal-50 dark:bg-teal-950"
            index={0}
            lang={lang}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KPICard
            title={t('dashboard.stock_value')}
            value={dashboardKPIS.totalInventoryValue.value}
            change={dashboardKPIS.totalInventoryValue.change}
            icon={DollarSign}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50 dark:bg-emerald-950"
            suffix={` ${curr}`}
            index={1}
            lang={lang}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KPICard
            title={t('dashboard.daily_transactions')}
            value={dashboardKPIS.todayTransactions.value}
            change={dashboardKPIS.todayTransactions.change}
            icon={Receipt}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50 dark:bg-blue-950"
            index={2}
            lang={lang}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KPICard
            title={t('dashboard.alerts')}
            value={dashboardKPIS.lowStockItems.value + dashboardKPIS.expiringSoon.value}
            icon={AlertTriangle}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-50 dark:bg-amber-950"
            index={3}
            lang={lang}
          />
        </motion.div>
      </motion.div>

      {/* Bento Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Weekly Sales AreaChart */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 card-glass card-glow rounded-2xl p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">{t('dashboard.weekly_sales')}</h3>
                <p className="text-xs text-[var(--text-muted)]">{t('dashboard.sales_analysis')}</p>
              </div>
            </div>
            <div className="badge badge-success">
              +{dashboardKPIS.todaySales.change}%
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklySales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${fmtNum(Math.round(v / 1000))}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    color: 'var(--text-primary)',
                    fontSize: 13,
                  }}
                  formatter={(value: number) => [`${fmtNum(value)} ${curr}`, t('dashboard.sales_chart')]}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#14b8a6"
                  strokeWidth={2.5}
                  fill="url(#colorSales)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution PieChart */}
        <motion.div variants={itemVariants} className="card-glass card-glow rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">{t('dashboard.category_distribution')}</h3>
              <p className="text-xs text-[var(--text-muted)]">{t('dashboard.category_dist_desc')}</p>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1200}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    color: 'var(--text-primary)',
                    fontSize: 13,
                  }}
                  formatter={(value: number, _name: string, props: any) => [
                    `${value}%`,
                    props.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            {categoryDistribution.map((cat) => {
              const Icon = getCategoryIcon(cat.name);
              return (
                <div key={cat.name} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">{cat.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{isAr ? toArabicNumerals(cat.value) : cat.value}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* Second Bento Row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Recent Transactions */}
        <motion.div variants={itemVariants} className="card-glass card-glow rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                <Receipt className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">{t('dashboard.recent_transactions')}</h3>
                <p className="text-xs text-[var(--text-muted)]">{t('dashboard.recent_transactions_desc')}</p>
              </div>
            </div>
            <button className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors">
              {t('dashboard.view_all')}
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
            {transactions.slice(0, 7).map((trx, i) => {
              const Icon = getTransactionIcon(trx.type);
              const colorClass = getTransactionColor(trx.type);
              return (
                <motion.div
                  key={trx.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.3 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{trx.id}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {trx.customer || t('dashboard.customer')} · {isAr ? toArabicNumerals(trx.itemCount) : trx.itemCount} {t('dashboard.piece')}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${trx.type === 'purchase' || trx.type === 'adjustment' ? 'text-red-500' : 'text-emerald-500'}`}>
                      {trx.type === 'purchase' || trx.type === 'adjustment' ? '-' : '+'}
                      {fmtNum(trx.amount)} {curr}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">{formatDate(trx.date, locale)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Alerts */}
        <motion.div variants={itemVariants} className="card-glass card-glow rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)]">{t('dashboard.alert_list')}</h3>
                <p className="text-xs text-[var(--text-muted)]">{t('dashboard.stock_alerts')}</p>
              </div>
            </div>
            <span className="badge badge-danger text-[10px]">
              {isAr ? toArabicNumerals(alerts.filter((a) => !a.read).length) : alerts.filter((a) => !a.read).length} {t('dashboard.unread_alerts')}
            </span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
            {alerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.3 }}
                className={`flex items-start gap-3 p-3 rounded-xl border ${getAlertColor(alert.severity)} bg-opacity-30`}
              >
                <div className="mt-0.5">
                  {alert.type === 'low_stock' && <Package className="w-4 h-4" />}
                  {alert.type === 'expiry' && <Sun className="w-4 h-4" />}
                  {alert.type === 'return' && <RotateCcw className="w-4 h-4" />}
                  {alert.type === 'system' && <SlidersHorizontal className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{alert.title}</p>
                    {!alert.read && (
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                    )}
                  </div>
                  <p className="text-xs opacity-80 mt-0.5 leading-relaxed">{alert.message}</p>
                  <p className="text-[10px] opacity-60 mt-1">{formatDate(alert.date, locale)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
