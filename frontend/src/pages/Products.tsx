import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Package,
  X,
  Pill,
  Sun,
  Sparkles,
  Wind,
  Flame,
  Droplets,
  CupSoda,
  ShieldCheck,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import { products, categories } from '../data/demoData';
import type { Product } from '../data/demoData';

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

const statusConfig: Record<
  Product['status'],
  { label: string; badge: string; color: string }
> = {
  active: { label: 'نشط', badge: 'badge-success', color: '#22c55e' },
  low_stock: { label: 'منخفض', badge: 'badge-warning', color: '#f59e0b' },
  out_of_stock: { label: 'نفد', badge: 'badge-danger', color: '#ef4444' },
  expired: { label: 'منتهي', badge: 'badge-danger', color: '#ef4444' },
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
  'مياه': CupSoda,
};

function getCategoryIcon(name: string) {
  return categoryIconMap[name] || SlidersHorizontal;
}

export function Products() {
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortKey, setSortKey] = useState<'name' | 'price' | 'stock' | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [itemsPerPage] = useState(7);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const filtered = useMemo(() => {
    let data = [...products];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      data = data.filter((p) => p.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      data = data.filter((p) => p.status === selectedStatus);
    }

    if (sortKey) {
      data.sort((a, b) => {
        const aVal = sortKey === 'name' ? a.name : a[sortKey];
        const bVal = sortKey === 'name' ? b.name : b[sortKey];
        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [search, selectedCategory, selectedStatus, sortKey, sortDir]);

  const pages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const pageItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: 'name' | 'price' | 'stock') => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            <span className="text-gradient">المنتجات</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            إدارة المنتجات، المخزون، والباركود
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <motion.div
            animate={{ width: searchOpen ? 260 : 44 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="h-11 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center overflow-hidden"
          >
            <button
              onClick={() => {
                setSearchOpen(true);
                setTimeout(() => searchRef.current?.focus(), 100);
              }}
              className="w-11 h-11 flex-shrink-0 flex items-center justify-center text-[var(--text-muted)]"
            >
              <Search className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {searchOpen && (
                <>
                  <motion.input
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    ref={searchRef}
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    onBlur={() => {
                      if (!search.trim()) setSearchOpen(false);
                    }}
                    placeholder="بحث في المنتجات..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] pr-2"
                  />
                  {search && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => {
                        setSearch('');
                        searchRef.current?.focus();
                      }}
                      className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Filters */}
          <div className="relative group">
            <button className="h-11 px-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <Filter className="w-4.5 h-4.5" />
              <span className="hidden sm:inline">تصفية</span>
            </button>
            <div className="absolute top-12 left-0 w-56 bg-[var(--bg-card)] backdrop-blur-2xl border border-[var(--border-subtle)] rounded-2xl shadow-2xl shadow-black/10 p-4 space-y-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
                  الفئة
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] outline-none focus:border-teal-500"
                >
                  <option value="all">الكل</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-2">
                  الحالة
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] outline-none focus:border-teal-500"
                >
                  <option value="all">الكل</option>
                  <option value="active">نشط</option>
                  <option value="low_stock">مخزون منخفض</option>
                  <option value="out_of_stock">نفد المخزون</option>
                  <option value="expired">منتهي الصلاحية</option>
                </select>
              </div>
            </div>
          </div>

          {/* Add button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddModal(true)}
            className="btn-premium text-sm gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة منتج</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="card-glass card-glow rounded-2xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] text-xs">
                <th className="px-5 py-4 text-right font-medium whitespace-nowrap">
                  <button
                    onClick={() => handleSort('name')}
                    className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
                  >
                    المنتج
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-5 py-4 text-right font-medium whitespace-nowrap">SKU</th>
                <th className="px-5 py-4 text-right font-medium whitespace-nowrap">الفئة</th>
                <th className="px-5 py-4 text-right font-medium whitespace-nowrap">
                  <button
                    onClick={() => handleSort('stock')}
                    className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
                  >
                    المخزون
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-5 py-4 text-right font-medium whitespace-nowrap">
                  <button
                    onClick={() => handleSort('price')}
                    className="inline-flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
                  >
                    السعر
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-5 py-4 text-right font-medium whitespace-nowrap">الحالة</th>
                <th className="px-5 py-4 text-center font-medium whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {pageItems.length === 0 ? (
                  <motion.tr
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan={7} className="px-5 py-16 text-center text-[var(--text-muted)]">
                      <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>لا توجد منتجات مطابقة</p>
                    </td>
                  </motion.tr>
                ) : (
                  pageItems.map((product, i) => {
                    const status = statusConfig[product.status];
                    const stockColor =
                      product.stock === 0
                        ? 'text-red-500'
                        : product.stock <= product.minStock
                          ? 'text-amber-500'
                          : 'text-emerald-500';
                    const lowStock = product.stock <= product.minStock && product.stock > 0;
                    const CategoryIcon = getCategoryIcon(product.category);

                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: i * 0.04 }}
                        className="table-row-glow border-b border-[var(--border-subtle)] last:border-b-0"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]">
                              <CategoryIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-[var(--text-primary)] text-sm">
                                {product.name}
                              </p>
                              {product.prescription && (
                                <span className="text-[10px] text-amber-500 font-medium">
                                      يتطلب وصفة
                                    </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[var(--text-secondary)] whitespace-nowrap">
                          {product.sku}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: status.color }}
                            />
                            {product.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold text-sm ${stockColor}`}>
                              {product.stock}
                            </span>
                            <span className="text-xs text-[var(--text-muted)]">
                              {product.unit}
                            </span>
                            {lowStock && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[var(--text-primary)] font-semibold whitespace-nowrap">
                          {product.price.toFixed(2)} ر.س
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`badge ${status.badge}`}>{status.label}</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                (window.location.hash = `/qr?product=${product.id}`)
                              }
                              title="عرض QR / الباركود"
                              className="w-9 h-9 rounded-lg flex items-center justify-center bg-teal-50 dark:bg-teal-950 text-teal-600 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors"
                            >
                              <QrCode className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-muted)]">
            عرض {pageItems.length} من {filtered.length} منتج
          </p>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-[var(--border-subtle)] text-[var(--text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
            <div className="flex items-center gap-1">
              {Array.from({ length: pages }, (_, i) => i + 1).map((page) => (
                <motion.button
                  key={page}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                  }`}
                >
                  {page}
                </motion.button>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))}
              disabled={currentPage === pages}
              className="w-9 h-9 rounded-xl flex items-center justify-center border border-[var(--border-subtle)] text-[var(--text-secondary)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg card-glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  إضافة منتج جديد
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    اسم المنتج
                  </label>
                  <input
                    type="text"
                    placeholder="أدخل اسم المنتج"
                    className="input-premium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                      SKU
                    </label>
                    <input
                      type="text"
                      placeholder="رمز المنتج"
                      className="input-premium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                      السعر
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="input-premium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                    الفئة
                  </label>
                  <select className="input-premium">
                    <option>اختر الفئة...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="btn-premium w-full gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة المنتج
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
