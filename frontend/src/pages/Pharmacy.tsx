import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pill,
  Calendar,
  Package,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  ScanLine,
  Search,
  Minus,
  Plus,
  Droplets,
  Tablet,
  Syringe,
  Sparkles,
  Wind,
  Flame,
  Sun,
  ShieldCheck,
  Barcode,
  ChevronDown,
  Check,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { products, transactions } from '../data/demoData';
import { KPICard } from '../components/KPICard';
import type { Product } from '../data/demoData';

/* ─── Helpers ──────────────────────────────────────────────────── */

function getExpiryStatus(expiryDate?: string): 'active' | 'near' | 'expired' {
  if (!expiryDate) return 'active';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  const diffMs = exp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'near';
  return 'active';
}

function formatDateAr(dateStr?: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function todayDateAr() {
  return new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const BAR_COLORS = ['#14b8a6', '#f59e0b', '#ef4444', '#a855f7', '#3b82f6'];

const STATUS_BADGE = {
  active: { label: 'فعال', className: 'badge-success' },
  near: { label: 'على وشك الانتهاء', className: 'badge-warning' },
  expired: { label: 'منتهي الصلاحية', className: 'badge-danger' },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'مسكنات الألم': Tablet,
  'مضادات حيوية': ShieldCheck,
  فيتامينات: Sun,
  'مضادات الهيستامين': Wind,
  'عناية شخصية': Sparkles,
  'هضم ومعدة': Flame,
  'عناية بالبشرة': Droplets,
  مياه: Droplets,
};

/* ─── Barcode visual ───────────────────────────────────────────── */

function BarcodeVisual({ value }: { value: string }) {
  const lines = useMemo(() => {
    const seed = value.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const arr: number[] = [];
    for (let i = 0; i < 30; i++) {
      arr.push(((seed * 9301 + 49297) % (i + 17)) % 3 === 0 ? 3 : i % 5 === 0 ? 2 : 1);
    }
    return arr;
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-end h-8 gap-[1px]">
        {lines.map((h, i) => (
          <div
            key={i}
            className="bg-[var(--text-primary)]"
            style={{ width: h === 3 ? 2 : 1, height: h === 3 ? '100%' : h === 2 ? '60%' : '80%' }}
          />
        ))}
      </div>
      <span className="text-[10px] text-[var(--text-muted)] font-mono tracking-widest">{value}</span>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────── */

export function Pharmacy() {
  const pharmacyProducts = useMemo(() => products.filter((p) => p.isPharmacy), []);

  /* augment with lot/ndc */
  const enriched = useMemo(
    () =>
      pharmacyProducts.map((p) => ({
        ...p,
        lotNumber: `LOT-${p.id.padStart(3, '0')}${p.sku.slice(-3)}`,
        ndc: `${p.id.padStart(5, '0')}-${p.sku.substring(0, 3).padEnd(3, 'X')}-${(p.stock % 100).toString().padStart(2, '0')}`,
        expiryStatus: getExpiryStatus(p.expiryDate),
      })),
    [pharmacyProducts]
  );

  /* KPIs */
  const totalMeds = pharmacyProducts.length;
  const nearExpiry = enriched.filter((p) => p.expiryStatus === 'near').length;
  const expiredCount = enriched.filter((p) => p.expiryStatus === 'expired').length;
  const dispensedToday = transactions.filter(
    (t) => t.type === 'sale' && t.date.startsWith(new Date().toISOString().slice(0, 10))
  ).length;

  /* Table filters */
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'near' | 'expired'>('all');

  const filteredTable = useMemo(() => {
    return enriched.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.includes(searchQuery) ||
        p.sku.includes(searchQuery) ||
        p.barcode.includes(searchQuery) ||
        p.ndc.includes(searchQuery) ||
        p.lotNumber.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || p.expiryStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [enriched, searchQuery, statusFilter]);

  /* Expiry chart data */
  const expiryChartData = useMemo(() => {
    const buckets = [
      { name: 'منتهية', count: 0 },
      { name: '< 30 يوم', count: 0 },
      { name: '1-3 شهور', count: 0 },
      { name: '3-6 شهور', count: 0 },
      { name: '6-12 شهر', count: 0 },
      { name: '> سنة', count: 0 },
    ];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    enriched.forEach((p) => {
      if (!p.expiryDate) return;
      const exp = new Date(p.expiryDate);
      const days = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (days < 0) buckets[0].count++;
      else if (days <= 30) buckets[1].count++;
      else if (days <= 90) buckets[2].count++;
      else if (days <= 180) buckets[3].count++;
      else if (days <= 365) buckets[4].count++;
      else buckets[5].count++;
    });
    return buckets;
  }, [enriched]);

  /* Category distribution */
  const catDistData = useMemo(() => {
    const map = new Map<string, number>();
    pharmacyProducts.forEach((p) => {
      map.set(p.category, (map.get(p.category) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [pharmacyProducts]);

  /* Dispensing state */
  const [scanQuery, setScanQuery] = useState('');
  const [selectedMed, setSelectedMed] = useState<(Product & { lotNumber: string; ndc: string; expiryStatus: string }) | null>(null);
  const [qty, setQty] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [dispensed, setDispensed] = useState(false);

  const handleScanSearch = useCallback(() => {
    const found = enriched.find(
      (p) =>
        p.name.includes(scanQuery) ||
        p.barcode === scanQuery ||
        p.sku === scanQuery ||
        p.ndc === scanQuery
    );
    if (found) {
      setSelectedMed(found);
      setQty(1);
      setInstructions('');
      setDispensed(false);
    } else {
      setSelectedMed(null);
    }
  }, [enriched, scanQuery]);

  const handleDispense = () => {
    setDispensed(true);
    setTimeout(() => {
      setDispensed(false);
      setSelectedMed(null);
      setScanQuery('');
      setQty(1);
      setInstructions('');
    }, 2500);
  };

  /* FEFO */
  const fefoList = useMemo(
    () =>
      enriched
        .filter((p) => p.expiryDate && p.stock > 0)
        .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime())
        .slice(0, 5),
    [enriched]
  );

  /* Animations */
  const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: 'easeOut' } };
  const staggerContainer = { animate: { transition: { staggerChildren: 0.1 } } };

  return (
    <div dir="rtl" className="space-y-8">
      {/* ═══ Header ═══════════════════════════════════════════════ */}
      <motion.div {...fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">الوضع الصيدلي</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {todayDateAr()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ═══ KPIs ══════════════════════════════════════════════════ */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <KPICard
          title="إجمالي الأدوية"
          value={totalMeds}
          icon={Package}
          iconColor="text-teal-600"
          iconBgColor="bg-teal-50 dark:bg-teal-950/40"
          index={0}
        />
        <KPICard
          title="على وشك الانتهاء"
          value={nearExpiry}
          icon={AlertTriangle}
          iconColor="text-amber-500"
          iconBgColor="bg-amber-50 dark:bg-amber-950/40"
          index={1}
        />
        <KPICard
          title="منتهية الصلاحية"
          value={expiredCount}
          icon={AlertCircle}
          iconColor="text-red-500"
          iconBgColor="bg-red-50 dark:bg-red-950/40"
          index={2}
        />
        <KPICard
          title="صرف اليوم"
          value={dispensedToday}
          icon={CheckCircle}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
          index={3}
        />
      </motion.div>

      {/* ═══ Bento Grid: Charts ═══════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Expiry Timeline */}
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }} className="card-glass card-glow p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">الأدوية حسب تاريخ الانتهاء</h3>
              <p className="text-xs text-[var(--text-muted)]">توزيع الأدوية بناءً على الفترة المتبقية</p>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expiryChartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-medium)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    fontSize: 13,
                    color: 'var(--text-primary)',
                  }}
                  cursor={{ fill: 'var(--accent-soft)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {expiryChartData.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Distribution by Type */}
        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.4 }} className="card-glass card-glow p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center">
              <Tablet className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">توزيع الأدوية حسب الفئة</h3>
              <p className="text-xs text-[var(--text-muted)]">نظرة عامة على تصنيفات الأدوية</p>
            </div>
          </div>
          <div className="space-y-3">
            {catDistData.map((cat, i) => {
              const Icon = CATEGORY_ICONS[cat.name] || Pill;
              const max = Math.max(...catDistData.map((c) => c.count));
              const pct = (cat.count / max) * 100;
              return (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[var(--text-secondary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[var(--text-primary)] truncate">{cat.name}</span>
                      <span className="text-sm font-bold text-[var(--text-primary)]">{cat.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.6 + i * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: BAR_COLORS[i % BAR_COLORS.length] }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {catDistData.length === 0 && (
              <p className="text-sm text-[var(--text-muted)] text-center py-6">لا توجد بيانات</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* ═══ Medicines Table ══════════════════════════════════════ */}
      <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.5 }} className="card-glass card-glow p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center">
              <Barcode className="w-5 h-5 text-teal-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">جدول الأدوية المفصل</h3>
              <p className="text-xs text-[var(--text-muted)]">عرض وإدارة تشغيلات الأدوية</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="بحث: اسم، SKU، باركود، NDC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-premium pr-10 pl-4 text-sm w-full sm:w-72"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="input-premium pr-10 pl-4 text-sm appearance-none cursor-pointer w-full sm:w-40"
              >
                <option value="all">الكل</option>
                <option value="active">فعال</option>
                <option value="near">على وشك</option>
                <option value="expired">منتهي</option>
              </select>
              <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                {['الباركود', 'رقم التشغيلة (Lot)', 'NDC', 'الاسم', 'الفئة', 'المخزون', 'تاريخ الانتهاء', 'الحالة'].map((h) => (
                  <th key={h} className="text-right px-3 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredTable.map((p, i) => {
                  const status = STATUS_BADGE[p.expiryStatus];
                  return (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3, delay: i * 0.03 }}
                      className="table-row-glow border-b border-[var(--border-subtle)]/50"
                    >
                      <td className="px-3 py-3">
                        <BarcodeVisual value={p.barcode} />
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-[var(--text-secondary)]">{p.lotNumber}</td>
                      <td className="px-3 py-3 font-mono text-xs text-[var(--text-secondary)]">{p.ndc}</td>
                      <td className="px-3 py-3 font-medium text-[var(--text-primary)]">{p.name}</td>
                      <td className="px-3 py-3 text-[var(--text-secondary)]">{p.category}</td>
                      <td className="px-3 py-3">
                        <span className={`font-semibold ${p.stock <= p.minStock ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                          {p.stock} <span className="text-xs font-normal text-[var(--text-muted)]">{p.unit}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-[var(--text-secondary)]">{formatDateAr(p.expiryDate)}</td>
                      <td className="px-3 py-3">
                        <span className={`badge ${status.className}`}>{status.label}</span>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filteredTable.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-[var(--text-muted)] text-sm">
                    لا توجد نتائج مطابقة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ═══ Dispensing Workflow ═════════════════════════════════= */}
      <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.6 }} className="card-glass card-glow p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">عملية صرف الدواء</h3>
            <p className="text-xs text-[var(--text-muted)]">امسح الباركود أو ابحث بالاسم لصرف الدواء</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <ScanLine className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="مسح الباركود أو البحث بالاسم / SKU / NDC..."
              value={scanQuery}
              onChange={(e) => setScanQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScanSearch()}
              className="input-premium pr-10 pl-4 text-sm"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleScanSearch}
            className="btn-premium text-sm px-6"
          >
            <Search className="w-4 h-4 ml-2" />
            بحث
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {selectedMed && (
            <motion.div
              key="dispense-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-5">
                {/* Medicine info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-500/20 flex-shrink-0">
                    <Pill className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-[var(--text-primary)]">{selectedMed.name}</h4>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-[var(--text-secondary)]">
                      <span className="font-mono">NDC: {selectedMed.ndc}</span>
                      <span className="font-mono">Lot: {selectedMed.lotNumber}</span>
                      <span className="font-mono">الباركود: {selectedMed.barcode}</span>
                      <span className={`badge ${STATUS_BADGE[selectedMed.expiryStatus as keyof typeof STATUS_BADGE].className}`}>
                        {STATUS_BADGE[selectedMed.expiryStatus as keyof typeof STATUS_BADGE].label}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[var(--text-muted)]">المخزون المتاح</p>
                    <p className={`text-xl font-bold ${selectedMed.stock === 0 ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                      {selectedMed.stock} <span className="text-sm font-normal">{selectedMed.unit}</span>
                    </p>
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-[var(--text-primary)] w-16">الكمية:</span>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-9 h-9 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] hover:border-teal-500 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </motion.button>
                    <span className="w-12 text-center font-bold text-lg text-[var(--text-primary)]">{qty}</span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQty(Math.min(selectedMed.stock, qty + 1))}
                      className="w-9 h-9 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] hover:border-teal-500 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">تعليمات الصرف</label>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="مثال: قرص واحد بعد الأكل ثلاث مرات يومياً..."
                    rows={2}
                    className="input-premium text-sm resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedMed(null); setScanQuery(''); }}
                    className="btn-secondary text-sm px-6"
                  >
                    إلغاء
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDispense}
                    disabled={selectedMed.stock === 0 || qty > selectedMed.stock}
                    className="btn-premium text-sm px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {dispensed ? (
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        تم الصرف بنجاح
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        تأكيد الصرف
                      </span>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ═══ FEFO Suggestions ════════════════════════════════════ */}
      <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.7 }} className="card-glass card-glow p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">اقتراحات FEFO</h3>
            <p className="text-xs text-[var(--text-muted)]">أقدم التشغيلات أولاً (First Expired, First Out)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {fefoList.map((p, i) => {
              const daysLeft = p.expiryDate
                ? Math.ceil((new Date(p.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                : 999;
              const isUrgent = daysLeft <= 30;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.08, duration: 0.4 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="relative p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-teal-500/50 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">{p.name}</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">{p.lotNumber}</p>
                    </div>
                    <span className={`badge text-[10px] ${isUrgent ? 'badge-warning' : 'badge-info'}`}>
                      {daysLeft <= 0 ? 'منتهي' : `${daysLeft} يوم`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span>NDC: <span className="font-mono">{p.ndc}</span></span>
                    <span>مخزون: <span className="font-bold text-[var(--text-primary)]">{p.stock}</span></span>
                  </div>

                  <p className="text-[11px] text-[var(--text-muted)]">
                    تاريخ الانتهاء: {formatDateAr(p.expiryDate)}
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setScanQuery(p.name);
                      setSelectedMed(p);
                      setQty(1);
                      setInstructions('');
                      setDispensed(false);
                      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    }}
                    className="w-full btn-premium text-xs py-2.5"
                    disabled={p.stock === 0}
                  >
                    استخدام هذه التشغيلة
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        {fefoList.length === 0 && (
          <p className="text-sm text-[var(--text-muted)] text-center py-6">لا توجد أدوية تتطلب صرفاً عاجلاً</p>
        )}
      </motion.div>
    </div>
  );
}
export default Pharmacy;
