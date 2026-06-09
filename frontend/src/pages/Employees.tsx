import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Plus, Search, Trash2, Calendar, DollarSign, CreditCard, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as api from '../api';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } };

function fmtNum(n: number) { return n.toLocaleString('en-US'); }

export function Employees() {
  const { t } = useTranslation();
  const [data, setData] = useState<api.Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showSalary, setShowSalary] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', role: 'cashier', base_salary: '', join_date: '', id_card: '', notes: '' });
  const [salaryForm, setSalaryForm] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), bonus: '', deductions: '', payment_method: 'cash', notes: '' });
  const [salaryHistory, setSalaryHistory] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try { setData(await api.employees.list()); } catch { setData([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.base_salary) return;
    await api.employees.create({
      name: form.name, phone: form.phone, email: form.email, role: form.role,
      base_salary: parseFloat(form.base_salary), join_date: form.join_date, id_card: form.id_card, notes: form.notes, status: 'active',
    });
    setForm({ name: '', phone: '', email: '', role: 'cashier', base_salary: '', join_date: '', id_card: '', notes: '' });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('common.delete') + '?')) return;
    await api.employees.del(id);
    load();
  };

  const openSalary = async (id: number) => {
    setShowSalary(id);
    try { setSalaryHistory(await api.employees.salaryHistory(id)); } catch { setSalaryHistory([]); }
  };

  const handlePaySalary = async (emp: api.Employee) => {
    const base = emp.base_salary;
    const bonus = parseFloat(salaryForm.bonus || '0');
    const deductions = parseFloat(salaryForm.deductions || '0');
    const net = base + bonus - deductions;
    await api.salaryPayments.create({
      employee_id: emp.id, amount: base, month: salaryForm.month, year: salaryForm.year,
      bonus, deductions, net_salary: net, payment_method: salaryForm.payment_method, status: 'paid', notes: salaryForm.notes,
    });
    setSalaryForm({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), bonus: '', deductions: '', payment_method: 'cash', notes: '' });
    openSalary(emp.id);
  };

  const filtered = data.filter((e) => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.phone?.includes(search));

  const roleIcon = (role: string) => {
    if (role === 'admin') return '🔴';
    if (role === 'manager') return '🟠';
    if (role === 'pharmacist') return '🟢';
    return '🔵';
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
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('employees.title')}</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{t('employees.title')}</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowForm(!showForm)} className="btn-premium text-sm px-4 py-2.5">
          <Plus className="w-4 h-4" /> {t('employees.add_employee')}
        </motion.button>
      </motion.div>

      {/* Summary */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="card-glass card-glow p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950"><Users className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">{t('employees.title')}</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{fmtNum(data.length)}</p>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="card-glass card-glow p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">{t('employees.base_salary')}</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{fmtNum(data.reduce((s, e) => s + e.base_salary, 0))} {t('currency.symbol')}</p>
            </div>
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="card-glass card-glow p-5 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950"><Briefcase className="w-5 h-5 text-teal-600" /></div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">{t('employees.active')}</p>
              <p className="text-xl font-bold text-[var(--text-primary)]">{fmtNum(data.filter((e) => e.status === 'active').length)}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Add Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="card-glass card-glow rounded-xl p-5">
          <h3 className="text-base font-semibold text-[var(--text-primary)] mb-4">{t('employees.add_employee')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder={t('employees.name')} className="input-premium" />
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder={t('employees.phone')} className="input-premium" />
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder={t('employees.email')} className="input-premium" />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-premium">
              <option value="cashier">{t('employees.cashier')}</option>
              <option value="pharmacist">{t('employees.pharmacist')}</option>
              <option value="manager">{t('employees.manager')}</option>
              <option value="admin">{t('employees.admin')}</option>
            </select>
            <input type="number" value={form.base_salary} onChange={e => setForm({ ...form, base_salary: e.target.value })} placeholder={t('employees.base_salary')} className="input-premium" />
            <input type="date" value={form.join_date} onChange={e => setForm({ ...form, join_date: e.target.value })} className="input-premium" />
            <input value={form.id_card} onChange={e => setForm({ ...form, id_card: e.target.value })} placeholder={t('employees.id_card')} className="input-premium" />
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder={t('employees.notes')} className="input-premium" />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} className="btn-premium">{t('common.save')}</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">{t('common.cancel')}</button>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <motion.div variants={itemVariants} className="card-glass card-glow p-4 rounded-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('common.search_placeholder')} className="input-premium pl-10 w-full" />
        </div>
      </motion.div>

      {/* Employee Cards */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((e) => (
          <motion.div key={e.id} variants={itemVariants} className="card-glass card-glow rounded-xl p-5 relative group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold">
                  {e.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{e.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{roleIcon(e.role)} {t(`employees.${e.role}`)}</p>
                </div>
              </div>
              <span className={`badge ${e.status === 'active' ? 'badge-success' : 'badge-neutral'} text-[10px]`}>{t(`employees.${e.status}`)}</span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[var(--text-muted)]">
                <DollarSign className="w-3.5 h-3.5" />
                <span>{t('employees.base_salary')}: <span className="text-[var(--text-primary)] font-medium">{fmtNum(e.base_salary)} {t('currency.symbol')}</span></span>
              </div>
              {e.phone && <div className="flex items-center gap-2 text-[var(--text-muted)]"><span className="text-xs">📞 {e.phone}</span></div>}
              {e.join_date && <div className="flex items-center gap-2 text-[var(--text-muted)]"><Calendar className="w-3.5 h-3.5" /><span className="text-xs">{e.join_date}</span></div>}
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={() => openSalary(e.id)} className="flex-1 text-xs btn-secondary py-2">
                {t('employees.salary')}
              </button>
              <button onClick={() => handleDelete(e.id)} className="px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Salary Modal */}
      {showSalary !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-glass card-glow rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            {(() => {
              const emp = data.find((e) => e.id === showSalary);
              if (!emp) return null;
              const net = emp.base_salary + parseFloat(salaryForm.bonus || '0') - parseFloat(salaryForm.deductions || '0');
              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">{emp.name} - {t('employees.salary_payments')}</h3>
                    <button onClick={() => setShowSalary(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">✕</button>
                  </div>

                  {/* Pay Salary Form */}
                  <div className="bg-[var(--bg-elevated)] rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3">{t('employees.add_salary')}</h4>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <select value={salaryForm.month} onChange={e => setSalaryForm({ ...salaryForm, month: parseInt(e.target.value) })} className="input-premium text-sm">
                        {Array.from({length: 12}, (_, i) => (
                          <option key={i+1} value={i+1}>{i+1}</option>
                        ))}
                      </select>
                      <input type="number" value={salaryForm.year} onChange={e => setSalaryForm({ ...salaryForm, year: parseInt(e.target.value) })} className="input-premium text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input type="number" value={salaryForm.bonus} onChange={e => setSalaryForm({ ...salaryForm, bonus: e.target.value })} placeholder={t('employees.bonus')} className="input-premium text-sm" />
                      <input type="number" value={salaryForm.deductions} onChange={e => setSalaryForm({ ...salaryForm, deductions: e.target.value })} placeholder={t('employees.deductions')} className="input-premium text-sm" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <select value={salaryForm.payment_method} onChange={e => setSalaryForm({ ...salaryForm, payment_method: e.target.value })} className="input-premium text-sm">
                        <option value="cash">{t('common.cash')}</option>
                        <option value="card">{t('common.card')}</option>
                        <option value="online">{t('common.online')}</option>
                      </select>
                      <div className="text-sm font-bold text-emerald-600">
                        {t('employees.net_salary')}: {fmtNum(net)} {t('currency.symbol')}
                      </div>
                    </div>
                    <button onClick={() => handlePaySalary(emp)} className="w-full btn-premium text-sm py-2">
                      <CreditCard className="w-4 h-4 inline mr-1" /> {t('employees.add_salary')}
                    </button>
                  </div>

                  {/* Salary History */}
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">{t('employees.salary_history')}</h4>
                  {salaryHistory.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)] text-center py-4">{t('common.no_data')}</p>
                  ) : (
                    <div className="space-y-2">
                      {salaryHistory.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                          <div>
                            <p className="text-sm font-medium">{p.month}/{p.year}</p>
                            <p className="text-xs text-[var(--text-muted)]">+{fmtNum(p.bonus)} / -{fmtNum(p.deductions)} / {fmtNum(p.net_salary)} {t('currency.symbol')}</p>
                          </div>
                          <span className={`badge ${p.status === 'paid' ? 'badge-success' : 'badge-warning'} text-[10px]`}>{p.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Employees;
