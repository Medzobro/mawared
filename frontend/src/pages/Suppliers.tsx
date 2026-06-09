import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Plus, Search, Trash2, Phone, Mail, MapPin, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as api from '../api';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } };

function fmtNum(n: number) { return n.toLocaleString('en-US'); }

export function Suppliers() {
  const { t } = useTranslation();
  const [data, setData] = useState<api.Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '', phone: '', email: '', address: '', notes: '' });

  const load = async () => {
    setLoading(true);
    try { setData(await api.suppliers.list()); } catch { setData([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name) return;
    await api.suppliers.create({ name: form.name, contact: form.contact, phone: form.phone, email: form.email, address: form.address, notes: form.notes, balance: 0, status: 'active' });
    setForm({ name: '', contact: '', phone: '', email: '', address: '', notes: '' });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('common.delete') + '?')) return;
    await api.suppliers.del(id);
    load();
  };

  const filtered = data.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.phone?.includes(search));

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('suppliers.title')}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t('suppliers.title')}</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowForm(!showForm)} className="btn-premium text-sm px-4 py-2.5">
          <Plus className="w-4 h-4" /> {t('suppliers.add_supplier')}
        </motion.button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card-glass card-glow rounded-xl p-5">
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-3">{t('suppliers.add_supplier')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('suppliers.name')} className="input-premium" />
            <input value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder={t('suppliers.contact')} className="input-premium" />
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder={t('suppliers.phone')} className="input-premium" />
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={t('suppliers.email')} className="input-premium" />
            <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder={t('suppliers.address')} className="input-premium" />
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder={t('suppliers.notes')} className="input-premium" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAdd} className="btn-premium">{t('common.save')}</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">{t('common.cancel')}</button>
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="card-glass card-glow p-4 rounded-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search_placeholder')} className="input-premium pl-10 w-full" />
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <motion.div key={s.id} variants={itemVariants} className="card-glass card-glow rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-bold">
                  {s.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{s.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{s.contact || '—'}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="space-y-1.5 text-sm">
              {s.phone && <div className="flex items-center gap-2 text-[var(--text-muted)]"><Phone className="w-3.5 h-3.5" /><span className="text-xs">{s.phone}</span></div>}
              {s.email && <div className="flex items-center gap-2 text-[var(--text-muted)]"><Mail className="w-3.5 h-3.5" /><span className="text-xs">{s.email}</span></div>}
              {s.address && <div className="flex items-center gap-2 text-[var(--text-muted)]"><MapPin className="w-3.5 h-3.5" /><span className="text-xs">{s.address}</span></div>}
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <DollarSign className="w-3.5 h-3.5" /><span className="text-xs">{t('suppliers.balance')}: {fmtNum(s.balance)} {t('currency.symbol')}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default Suppliers;
