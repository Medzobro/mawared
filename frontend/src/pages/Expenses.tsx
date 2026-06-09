import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Plus, Search, Download, PieChart, TrendingUp, Filter } from 'lucide-react';
import { ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import * as api from '../api';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } };

const EXPENSE_COLORS = {
  general: '#64748b', rent: '#f59e0b', utilities: '#3b82f6', salaries: '#10b981',
  inventory: '#8b5cf6', marketing: '#ec4899', maintenance: '#ef4444', transport: '#06b6d4', other: '#94a3b8',
};

function fmtNum(n: number) { return n.toLocaleString('en-US'); }

export function Expenses() {
  const { t } = useTranslation();
  const [data, setData] = useState<api.Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [summary, setSummary] = useState({ total: 0, count: 0, by_category: [] as any[] });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'general', description: '', amount: '', date: '', payment_method: 'cash' });

  const load = async () => {
    setLoading(true);
    try {
      const [list, sum] = await Promise.all([
        api.expenses.list(filterCategory !== 'all' ? { category: filterCategory } : undefined),
        api.expenses.summary(),
      ]);
      setData(list);
      setSummary(sum);
    } catch { setData([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterCategory]);

  const handleAdd = async () => {
    if (!form.description || !form.amount || !form.date) return;
    await api.expenses.create({
      category: form.category, description: form.description, amount: parseFloat(form.amount),
      date: form.date, payment_method: form.payment_method, created_by: '',
    });
    setForm({ category: 'general', description: '', amount: '', date: '', payment_method: 'cash' });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('common.delete') + '?')) return;
    await api.expenses.del(id);
    load();
  };

  const filtered = data.filter((e) =>
    !search || e.description.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase())
  );

  const chartData = summary.by_category.map((c) => ({
    name: t(`expenses.${c.category}`) || c.category,
    value: c.amount,
    color: (EXPENSE_COLORS as any)[c.category] || '#94a3b8',
  }));

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('expenses.title')}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t('expenses.title')}</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowForm(!showForm)} className="btn-premium text-sm px-4 py-2.5">
          <Plus className="w-4 h-4" /> {t('expenses.add_expense')}
        </motion.button>
      </motion.div>

      {/* Summary */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="card-glass card-glow p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950"><DollarSign className="w-5 h-5 text-red-600" /></div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">{t('expenses.total')}</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{fmtNum(summary.total)} {t('currency.symbol')}</p>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="card-glass card-glow p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">{t('expenses.count')}</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{fmtNum(summary.count)}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Chart + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="card-glass card-glow rounded-xl p-5">
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4" /> {t('expenses.by_category')}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" stroke="none">
                  {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`${fmtNum(Number(v))} ${t('currency.symbol')}`, t('expenses.amount')]} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, color: 'var(--text-primary)', fontSize: 13 }} />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {showForm && (
          <motion.div variants={itemVariants} className="card-glass card-glow rounded-xl p-5 lg:col-span-2">
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">{t('expenses.add_expense')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-premium">
                {['general','rent','utilities','salaries','inventory','marketing','maintenance','transport','other'].map((c) => (
                  <option key={c} value={c}>{t(`expenses.${c}`)}</option>
                ))}
              </select>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder={t('expenses.amount')} className="input-premium" />
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-premium" />
              <select value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })} className="input-premium">
                <option value="cash">{t('common.cash')}</option>
                <option value="card">{t('common.card')}</option>
                <option value="online">{t('common.online')}</option>
              </select>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={t('expenses.description')} className="input-premium sm:col-span-2" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleAdd} className="btn-premium">{t('common.save')}</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary">{t('common.cancel')}</button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="card-glass card-glow p-4 rounded-xl flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search_placeholder')} className="input-premium pl-10 w-full" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="input-premium">
          <option value="all">{t('expenses.all')}</option>
          {['general','rent','utilities','salaries','inventory','marketing','maintenance','transport','other'].map((c) => (
            <option key={c} value={c}>{t(`expenses.${c}`)}</option>
          ))}
        </select>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants} className="card-glass card-glow rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
              <tr>
                {['date','category','description','amount','payment_method','actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-right font-medium text-[var(--text-muted)]">{t(`expenses.${h}`) || t(`common.${h}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[var(--text-muted)]">{t('expenses.no_expenses')}</td></tr>
              ) : filtered.map((e) => (
                <tr key={e.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors">
                  <td className="px-4 py-3">{e.date}</td>
                  <td className="px-4 py-3">
                    <span className="badge badge-neutral text-[10px]">{t(`expenses.${e.category}`) || e.category}</span>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">{e.description}</td>
                  <td className="px-4 py-3 font-semibold text-red-500">-{fmtNum(e.amount)} {t('currency.symbol')}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{t(`common.${e.payment_method}`)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(e.id)} className="text-red-500 hover:text-red-600 transition-colors">{t('common.delete')}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

export default Expenses;
