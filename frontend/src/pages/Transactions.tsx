import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Search, Filter, Download, Plus, ArrowUpLeft, ArrowDownRight, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as api from '../api';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } };

function fmtNum(n: number) { return n.toLocaleString('en-US'); }
function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function getTransactionIcon(type: string) {
  if (type === 'sale') return ArrowUpLeft;
  if (type === 'purchase') return ArrowDownRight;
  if (type === 'return') return RotateCcw;
  return SlidersHorizontal;
}
function getTransactionColor(type: string) {
  if (type === 'sale') return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950';
  if (type === 'purchase') return 'text-blue-500 bg-blue-50 dark:bg-blue-950';
  if (type === 'return') return 'text-amber-500 bg-amber-50 dark:bg-amber-950';
  return 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800';
}
function getTypeLabel(type: string, t: any) {
  if (type === 'sale') return t('transactions.sale');
  if (type === 'purchase') return t('transactions.purchase');
  if (type === 'return') return t('transactions.return');
  if (type === 'adjustment') return t('transactions.adjustment');
  return type;
}

export function Transactions() {
  const { t } = useTranslation();
  const [data, setData] = useState<api.Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [summary, setSummary] = useState({ total_sales: 0, total_purchases: 0, total_returns: 0, total_adjustments: 0, count: 0 });

  useEffect(() => {
    api.transactions.list(filterType !== 'all' ? { type: filterType } : undefined).then(setData).catch(() => setData([])).finally(() => setLoading(false));
    api.transactions.summary().then(setSummary).catch(() => {});
  }, [filterType]);

  const filtered = data.filter((t) =>
    !search || t.customer?.toLowerCase().includes(search.toLowerCase()) || t.items.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('transactions.title')}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t('transactions.title')}</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-premium text-sm px-4 py-2.5">
          <Plus className="w-4 h-4" /> {t('transactions.add_transaction')}
        </motion.button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('transactions.total_sales'), value: summary.total_sales, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950' },
          { label: t('transactions.total_purchases'), value: summary.total_purchases, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
          { label: t('transactions.total_returns'), value: summary.total_returns, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950' },
          { label: t('transactions.total'), value: summary.total_sales + summary.total_purchases + summary.total_returns, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950' },
        ].map((c, i) => (
          <motion.div key={i} variants={itemVariants} className={`card-glass card-glow p-4 rounded-xl ${c.bg}`}>
            <p className="text-xs text-[var(--text-muted)] mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.color}`}>{fmtNum(c.value)} {t('currency.symbol')}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="card-glass card-glow p-4 rounded-xl flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search_placeholder')} className="input-premium pl-10 w-full" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input-premium">
          <option value="all">{t('transactions.all')}</option>
          <option value="sale">{t('transactions.sale')}</option>
          <option value="purchase">{t('transactions.purchase')}</option>
          <option value="return">{t('transactions.return')}</option>
          <option value="adjustment">{t('transactions.adjustment')}</option>
        </select>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants} className="card-glass card-glow rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)]">
              <tr>
                {['type', 'amount', 'customer', 'items', 'date', 'status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-right font-medium text-[var(--text-muted)]">{t(`transactions.${h}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-[var(--text-muted)]">{t('transactions.no_transactions')}</td></tr>
              ) : filtered.map((trx) => {
                const Icon = getTransactionIcon(trx.type);
                return (
                  <tr key={trx.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-2 w-fit px-2 py-1 rounded-lg ${getTransactionColor(trx.type)}`}>
                        <Icon className="w-4 h-4" />
                        <span className="font-medium text-xs">{getTypeLabel(trx.type, t)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{trx.type === 'purchase' || trx.type === 'adjustment' ? '-' : '+'}{fmtNum(trx.amount)} {t('currency.symbol')}</td>
                    <td className="px-4 py-3">{trx.customer || '—'}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{trx.items}</td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{fmtDate(trx.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${trx.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{trx.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

export default Transactions;
