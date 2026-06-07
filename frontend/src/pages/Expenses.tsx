import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Trash2, Edit2, X, Save, TrendingDown,
  CreditCard, Wallet, Globe, Receipt, DollarSign,
  Calendar, Filter, ChevronDown, AlertTriangle, Check,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as api from '../api';
import type { Expense } from '../api';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } } };

const EXPENSE_CATEGORIES = [
  { key: 'rent', icon: Receipt, color: '#ef4444' },
  { key: 'utilities', icon: CreditCard, color: '#f59e0b' },
  { key: 'salaries', icon: DollarSign, color: '#22c55e' },
  { key: 'supplies', icon: Wallet, color: '#3b82f6' },
  { key: 'maintenance', icon: AlertTriangle, color: '#a855f7' },
  { key: 'marketing', icon: Globe, color: '#ec4899' },
  { key: 'transport', icon: CreditCard, color: '#06b6d4' },
  { key: 'other', icon: Receipt, color: '#64748b' },
];

const PAYMENT_METHODS = ['cash', 'card', 'online'];

export function Expenses() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'other',
    date: new Date().toISOString().split('T')[0],
    description: '',
    payment_method: 'cash',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.expenses.list();
      setItems(data);
    } catch (e) {
      console.error('Failed to load expenses', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  const fmtNum = (n: number) => n.toLocaleString('en-US');

  const total = useMemo(() => items.reduce((sum, i) => sum + i.amount, 0), [items]);
  const monthly = useMemo(() => {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return items.filter((i) => i.date.startsWith(monthStr)).reduce((sum, i) => sum + i.amount, 0);
  }, [items]);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', amount: '', category: 'other', date: new Date().toISOString().split('T')[0], description: '', payment_method: 'cash' });
    setShowModal(true);
  };

  const openEdit = (item: Expense) => {
    setEditing(item);
    setForm({
      title: item.title,
      amount: String(item.amount),
      category: item.category,
      date: item.date,
      description: item.description,
      payment_method: item.payment_method,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.amount || !form.date) return;
    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount) };
      if (editing) {
        await api.expenses.update(editing.id, payload);
      } else {
        await api.expenses.create(payload);
      }
      await loadData();
      setShowModal(false);
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.expenses.del(deleteId);
      await loadData();
    } catch (e) {
      console.error('Delete failed', e);
    } finally {
      setDeleteId(null);
    }
  };

  const getCategoryIcon = (cat: string) => {
    const c = EXPENSE_CATEGORIES.find((x) => x.key === cat);
    return c ? c.icon : Receipt;
  };

  const getCategoryColor = (cat: string) => {
    const c = EXPENSE_CATEGORIES.find((x) => x.key === cat);
    return c ? c.color : '#64748b';
  };

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('expenses.title')}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t('expenses.expense_categories')}</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openAdd} className="btn-premium text-sm px-4 py-2.5 flex items-center gap-2">
          <Plus className="w-4 h-4" />{t('expenses.add_expense')}
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="card-glass card-glow p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10"><TrendingDown className="w-5 h-5 text-red-500" /></div>
            <div>
              <div className="text-xs text-[var(--text-muted)]">{t('expenses.total_expenses')}</div>
              <div className="text-xl font-bold text-[var(--text-primary)]">{fmtNum(total)}</div>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="card-glass card-glow p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10"><Calendar className="w-5 h-5 text-amber-500" /></div>
            <div>
              <div className="text-xs text-[var(--text-muted)]">{t('expenses.monthly_expenses')}</div>
              <div className="text-xl font-bold text-[var(--text-primary)]">{fmtNum(monthly)}</div>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="card-glass card-glow p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10"><Receipt className="w-5 h-5 text-blue-500" /></div>
            <div>
              <div className="text-xs text-[var(--text-muted)]">{t('products.items')}</div>
              <div className="text-xl font-bold text-[var(--text-primary)]">{fmtNum(items.length)}</div>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="card-glass card-glow p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10"><DollarSign className="w-5 h-5 text-emerald-500" /></div>
            <div>
              <div className="text-xs text-[var(--text-muted)]">{t('expenses.amount')}</div>
              <div className="text-xl font-bold text-[var(--text-primary)]">{items.length ? fmtNum(Number((total / items.length).toFixed(2))) : '0'}</div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="card-glass card-glow p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] ${isAr ? 'right-3' : 'left-3'}`} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('expenses.search_placeholder')}
              className={`input-premium w-full ${isAr ? 'pr-10' : 'pl-10'}`}
            />
          </div>
          <div className="relative sm:w-48">
            <Filter className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] ${isAr ? 'right-3' : 'left-3'}`} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`input-premium w-full appearance-none ${isAr ? 'pr-10' : 'pl-10'}`}
            >
              <option value="all">{t('common.all')}</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>{t(`expenses.${c.key}`)}</option>
              ))}
            </select>
            <ChevronDown className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none ${isAr ? 'left-3' : 'right-3'}`} />
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="card-glass card-glow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
            <Receipt className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">{t('expenses.no_expenses')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">{t('expenses.expense_name')}</th>
                  <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">{t('expenses.category')}</th>
                  <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">{t('expenses.amount')}</th>
                  <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">{t('expenses.payment_method')}</th>
                  <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">{t('expenses.date')}</th>
                  <th className="px-4 py-3 text-left text-[var(--text-muted)] font-medium">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((item, idx) => {
                    const Icon = getCategoryIcon(item.category);
                    const color = getCategoryColor(item.category);
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                              <Icon className="w-4 h-4" style={{ color }} />
                            </div>
                            <span className="font-medium text-[var(--text-primary)]">{item.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md text-xs font-medium" style={{ background: `${color}20`, color }}>
                            {t(`expenses.${item.category}`)}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">{fmtNum(item.amount)}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-[var(--text-secondary)] capitalize">{t(`expenses.${item.payment_method}`)}</span>
                        </td>
                        <td className="px-4 py-3 text-[var(--text-secondary)]">{item.date}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteId(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="card-glass w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">{editing ? t('expenses.edit_expense') : t('expenses.add_new_expense')}</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('expenses.expense_name')}</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('expenses.enter_expense_name')} className="input-premium w-full" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('expenses.amount')}</label>
                    <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder={t('expenses.enter_amount')} className="input-premium w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('expenses.date')}</label>
                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-premium w-full" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('expenses.category')}</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-premium w-full">
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c.key} value={c.key}>{t(`expenses.${c.key}`)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('expenses.payment_method')}</label>
                    <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="input-premium w-full">
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m} value={m}>{t(`expenses.${m}`)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{t('expenses.description')}</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t('expenses.enter_description')} rows={3} className="input-premium w-full resize-none" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving} className="btn-premium flex-1 text-sm px-4 py-2.5 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />{saving ? '...' : t('common.save')}
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModal(false)} className="btn-secondary text-sm px-4 py-2.5 flex items-center gap-2">
                  <X className="w-4 h-4" />{t('common.cancel')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="card-glass w-full max-w-sm p-6 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{t('common.confirm')}</h3>
              <p className="text-sm text-[var(--text-muted)] mb-5">{t('expenses.delete_confirm')}</p>
              <div className="flex items-center gap-2 justify-center">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDelete} className="btn-premium text-sm px-4 py-2 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />{t('common.delete')}
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setDeleteId(null)} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                  <X className="w-4 h-4" />{t('common.cancel')}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
