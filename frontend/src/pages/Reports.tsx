import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, Calendar, Download, FileText, DollarSign, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } };

const DUMMY_SALES = [
  { day: 'السبت', sales: 12500, profit: 3200 },
  { day: 'الأحد', sales: 18400, profit: 5100 },
  { day: 'الإثنين', sales: 11200, profit: 2800 },
  { day: 'الثلاثاء', sales: 22100, profit: 6200 },
  { day: 'الأربعاء', sales: 15600, profit: 4100 },
  { day: 'الخميس', sales: 8900, profit: 1900 },
  { day: 'الجمعة', sales: 24500, profit: 7100 },
];

const DUMMY_INVENTORY = [
  { category: 'مسكنات', stock: 120, value: 8500 },
  { category: 'مضادات', stock: 45, value: 5200 },
  { category: 'فيتامينات', stock: 200, value: 11200 },
  { category: 'هيستامين', stock: 8, value: 3400 },
  { category: 'عناية', stock: 85, value: 7600 },
  { category: 'بشرة', stock: 32, value: 9800 },
  { category: 'مشروبات', stock: 0, value: 0 },
  { category: 'هضم', stock: 78, value: 4500 },
];

function fmtNum(n: number) { return n.toLocaleString('en-US'); }

export function Reports() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState('today');
  const [reportType, setReportType] = useState('sales');

  const renderReport = () => {
    if (reportType === 'sales') return (
      <div className="space-y-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DUMMY_SALES} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs><linearGradient id="colorSales2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.02} />
              </linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${fmtNum(Math.round(v / 1000))}k`} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, color: 'var(--text-primary)', fontSize: 13 }} formatter={(value: any, name: any) => [`${fmtNum(Number(value))} MRU`, name === 'sales' ? 'المبيعات' : 'الأرباح']} />
              <Area type="monotone" dataKey="sales" stroke="#14b8a6" strokeWidth={2.5} fill="url(#colorSales2)" />
              <Area type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'إجمالي المبيعات', value: 113200, color: 'text-teal-600' },
            { label: 'إجمالي الأرباح', value: 30400, color: 'text-emerald-600' },
            { label: 'عدد العمليات', value: 342, color: 'text-blue-600' },
            { label: 'متوسط المبيعات', value: 16171, color: 'text-purple-600' },
          ].map((s, i) => (
            <div key={i} className="card-glass card-glow p-4 rounded-xl">
              <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{fmtNum(s.value)} {t('currency.symbol')}</p>
            </div>
          ))}
        </div>
      </div>
    );
    if (reportType === 'inventory') return (
      <div className="space-y-4">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DUMMY_INVENTORY} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="category" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, color: 'var(--text-primary)', fontSize: 13 }} formatter={(value: any, name: any) => [`${fmtNum(Number(value))}`, name === 'stock' ? 'المخزون' : 'القيمة']} />
              <Bar dataKey="stock" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
    return (
      <div className="text-center py-12 text-[var(--text-muted)]">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>{t('reports.title')}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('reports.title')}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t('reports.title')}</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-premium text-sm px-4 py-2.5">
          <Download className="w-4 h-4" /> {t('reports.export')}
        </motion.button>
      </motion.div>

      {/* Report type tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'sales', icon: TrendingUp, label: t('reports.sales_report') },
          { key: 'inventory', icon: Package, label: t('reports.inventory_report') },
          { key: 'financial', icon: DollarSign, label: t('reports.financial_report') },
          { key: 'expense', icon: BarChart3, label: t('reports.expense_report') },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setReportType(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              reportType === tab.key
                ? 'bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border border-teal-500 dark:border-teal-400'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)]'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Period filter */}
      <motion.div variants={itemVariants} className="flex gap-2">
        {['today', 'this_week', 'this_month', 'this_year', 'custom'].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              period === p
                ? 'bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border border-teal-500 dark:border-teal-400'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)]'
            }`}
          >
            {t(`common.${p}`)}
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="card-glass card-glow rounded-xl p-5">
        {renderReport()}
      </motion.div>
    </div>
  );
}

export default Reports;
