import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, LogIn, LogOut, Users, Calendar, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as api from '../api';

interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee_name: string;
  date: string;
  check_in: string;
  check_out: string | null;
  status: 'present' | 'absent' | 'late' | 'leave';
  notes: string;
}

interface Employee {
  id: number;
  name: string;
  role: string;
}

export function Attendance() {
  const { t } = useTranslation();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | ''>('');
  const [today, setToday] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.employees.list().then((data: any) => setEmployees(data || [])).catch(() => setEmployees([]));
    loadRecords();
  }, [today]);

  const loadRecords = () => {
    api.attendance.list({ date: today }).then((data: any) => setRecords(data || [])).catch(() => setRecords([]));
  };

  const checkIn = async () => {
    if (!selectedEmployee) return;
    setLoading(true);
    try {
      await api.attendance.checkIn({ employee_id: selectedEmployee, date: today, check_in: new Date().toTimeString().slice(0,5) });
      loadRecords();
    } catch (e) {}
    setLoading(false);
  };

  const checkOut = async (recordId: number) => {
    setLoading(true);
    try {
      await api.attendance.checkOut(recordId, { check_out: new Date().toTimeString().slice(0,5) });
      loadRecords();
    } catch (e) {}
    setLoading(false);
  };

  const filtered = filter === 'all' ? records : records.filter(r => r.status === filter);

  const stats = {
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
    leave: records.filter(r => r.status === 'leave').length,
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">{t('attendance.title') || 'الحضور والانصراف'}</h1>
              <p className="text-xs text-[var(--text-muted)]">{today}</p>
            </div>
          </div>
          <input type="date" value={today} onChange={e => setToday(e.target.value)} className="input-premium w-40" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t('attendance.present') || 'حاضر', value: stats.present, color: 'text-green-400', icon: CheckCircle2 },
            { label: t('attendance.absent') || 'غائب', value: stats.absent, color: 'text-red-400', icon: XCircle },
            { label: t('attendance.late') || 'متأخر', value: stats.late, color: 'text-yellow-400', icon: Clock },
            { label: t('attendance.leave') || 'إجازة', value: stats.leave, color: 'text-blue-400', icon: Calendar },
          ].map(s => (
            <motion.div key={s.label} whileHover={{ scale: 1.02 }} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3 text-center">
              <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
              <p className="text-lg font-bold text-[var(--text-primary)]">{s.value.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Check-in */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-[var(--text-muted)] mb-1 block">{t('attendance.selectEmployee') || 'اختر موظف'}</label>
              <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value ? parseInt(e.target.value) : '')} className="input-premium w-full">
                <option value="">{t('attendance.select') || 'اختر...'}</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} — {e.role}</option>
                ))}
              </select>
            </div>
            <button onClick={checkIn} disabled={!selectedEmployee || loading} className="btn-premium gap-2">
              <LogIn className="w-4 h-4" /> {t('attendance.checkIn') || 'تسجيل دخول'}
            </button>
          </div>
        </div>

        {/* Records */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <h3 className="font-bold text-[var(--text-primary)]">{t('attendance.records') || 'سجل الحضور'}</h3>
            <div className="flex gap-1">
              {['all', 'present', 'absent', 'late'].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-lg text-xs transition-all ${filter === f ? 'bg-teal-500/20 text-teal-400' : 'text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'}`}>
                  {t(`attendance.${f}`) || f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">{t('attendance.employee') || 'الموظف'}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('attendance.checkIn') || 'دخول'}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('attendance.checkOut') || 'خروج'}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('attendance.status') || 'الحالة'}</th>
                  <th className="px-4 py-3 text-right font-medium">{t('attendance.actions') || 'إجراء'}</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map(r => (
                    <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[var(--text-muted)]" />
                          <span className="font-medium">{r.employee_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">{r.check_in || '-'}</td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">{r.check_out || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                          r.status === 'present' ? 'bg-green-500/10 text-green-400' :
                          r.status === 'absent' ? 'bg-red-500/10 text-red-400' :
                          r.status === 'late' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {t(`attendance.${r.status}`) || r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {!r.check_out && (
                          <button onClick={() => checkOut(r.id)} disabled={loading} className="btn-ghost text-sm gap-1">
                            <LogOut className="w-3 h-3" /> {t('attendance.checkOut') || 'خروج'}
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-muted)]">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      {t('attendance.noRecords') || 'لا يوجد سجل لهذا اليوم'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
