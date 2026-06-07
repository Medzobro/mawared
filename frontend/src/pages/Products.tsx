import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, ChevronLeft, ChevronRight, QrCode, Package, X,
  Pill, Sun, Sparkles, Wind, Flame, Droplets, CupSoda, ShieldCheck,
  SlidersHorizontal, ArrowUpDown, Trash2, Edit, Check, Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as api from '../api';
import { toArabicNumerals } from '../i18n/helpers';

const categoryIconMap: Record<any, any> = {
  'مسكنات الألم': Pill, 'مضادات حيوية': ShieldCheck, 'فيتامينات': Sun,
  'مضادات الهيستامين': Wind, 'عناية شخصية': Sparkles, 'هضم ومعدة': Flame,
  'عناية بالبشرة': Droplets, 'مياه ومشروبات': CupSoda,
};
function getCategoryIcon(name: string) { return categoryIconMap[name] || SlidersHorizontal; }

export function Products() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'ar';
  const isAr = lang === 'ar';
  const fmt = (n: number) => (isAr ? toArabicNumerals(Math.round(n)) : n.toString());
  const curr = t('currency.symbol') || 'MRU';

  const [products, setProducts] = useState<api.Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<api.Product | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const itemsPerPage = 8;

  const load = async () => {
    setLoading(true);
    const [ps, cs] = await Promise.all([api.products.list({page: String(currentPage), limit: String(itemsPerPage)}), api.categories.list()]);
    setProducts(ps.items || []);
    setTotalProducts(ps.total || 0);
    setTotalPages(ps.pages || 1);
    setCategories(cs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let d = [...products];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      d = d.filter((p: any) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q));
    }
    if (selectedCategory !== 'all') d = d.filter((p: any) => p.category === selectedCategory);
    if (selectedStatus !== 'all') d = d.filter((p: any) => p.status === selectedStatus);
    d.sort((a: any, b: any) => {
      const aVal = sortKey === 'name' ? a.name : sortKey === 'price' ? a.price : a.stock;
      const bVal = sortKey === 'name' ? b.name : sortKey === 'price' ? b.price : b.stock;
      return sortDir === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    return d;
  }, [products, search, selectedCategory, selectedStatus, sortKey, sortDir]);

  // Server-side pagination: pageItems is already paginated from API
  const pageItems = products;
  const pages = totalPages;

  const handleSort = (k: string) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
  };

  const ProductForm = ({ initial, onClose }: { initial?: api.Product | null; onClose: () => void }) => {
    const [form, setForm] = useState({
      name: initial?.name || '', sku: initial?.sku || '', barcode: initial?.barcode || '',
      category: initial?.category || (categories[0]?.name || ''), price: initial?.price || 0, cost: initial?.cost || 0,
      stock: initial?.stock ?? 0, min_stock: initial?.min_stock ?? 10, unit: initial?.unit || 'piece',
      is_pharmacy: initial?.is_pharmacy || false, prescription: initial?.prescription || false,
      supplier: initial?.supplier || '', status: initial?.status || 'active', expiry_date: initial?.expiry_date || '',
    });
    const [saving, setSaving] = useState(false);

    const submit = async () => {
      if (!form.name || !form.sku || !form.barcode) return;
      setSaving(true);
      try {
        if (initial) await api.products.update(initial.id, form);
        else await api.products.create(form as any);
        onClose();
        load();
      } catch (e) { console.error(e); }
      setSaving(false);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="w-full max-w-lg card-glass rounded-2xl p-6 max-h-[90vh] overflow-y-auto space-y-3">
          <h3 className="text-lg font-bold">{initial ? 'تعديل منتج' : 'إضافة منتج جديد'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="اسم المنتج" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="input-premium" />
            <input placeholder="SKU" value={form.sku} onChange={e=>setForm({...form, sku:e.target.value})} className="input-premium" />
            <input placeholder="الباركود" value={form.barcode} onChange={e=>setForm({...form, barcode:e.target.value})} className="input-premium" />
            <select value={form.category} onChange={e=>setForm({...form, category:e.target.value})} className="input-premium">{categories.map((c: any) => <option key={c.name} value={c.name}>{c.name}</option>)}</select>
            <input type="number" placeholder="السعر" value={form.price} onChange={e=>setForm({...form, price:+e.target.value})} className="input-premium" />
            <input type="number" placeholder="التكلفة" value={form.cost} onChange={e=>setForm({...form, cost:+e.target.value})} className="input-premium" />
            <input type="number" placeholder="المخزون" value={form.stock} onChange={e=>setForm({...form, stock:+e.target.value})} className="input-premium" />
            <input type="number" placeholder="حد الأدنى" value={form.min_stock} onChange={e=>setForm({...form, min_stock:+e.target.value})} className="input-premium" />
            <input placeholder="الوحدة" value={form.unit} onChange={e=>setForm({...form, unit:e.target.value})} className="input-premium" />
            <input placeholder="المورد" value={form.supplier} onChange={e=>setForm({...form, supplier:e.target.value})} className="input-premium" />
            <input type="date" placeholder="تاريخ الانتهاء" value={form.expiry_date} onChange={e=>setForm({...form, expiry_date:e.target.value})} className="input-premium" />
            <select value={form.status} onChange={e=>setForm({...form, status:e.target.value})} className="input-premium">
              <option value="active">نشط</option>
              <option value="low_stock">منخفض</option>
              <option value="out_of_stock">نفاد</option>
              <option value="expired">منتهي</option>
            </select>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_pharmacy} onChange={e=>setForm({...form, is_pharmacy:e.target.checked})} /><span>صيدلي</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.prescription} onChange={e=>setForm({...form, prescription:e.target.checked})} /><span>يتطلب وصفة</span></label>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={submit} disabled={saving} className="btn-premium flex-1">{saving ? '...' : <><Check className="w-4 h-4" /> حفظ</>}</button>
            <button onClick={onClose} className="btn-secondary flex-1">إلغاء</button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('products.title')}</h1><p className="text-sm text-[var(--text-secondary)]">{t('products.product_desc')}</p></div>
        <button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="btn-premium gap-2">
          <Plus className="w-4 h-4" />{t('products.add_product')}
        </button>
      </motion.div>

      <AnimatePresence>
        {showForm && <ProductForm initial={editingProduct} onClose={() => setShowForm(false)} />}
        {deleteId !== null && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="card-glass rounded-2xl p-6 text-center max-w-sm">
              <Trash2 className="w-10 h-10 mx-auto mb-3 text-red-500" />
              <p>هل أنت متأكد من حذف هذا المنتج؟</p>
              <div className="flex gap-2 mt-4">
                <button onClick={async () => { await api.products.del(deleteId); setDeleteId(null); load(); }} className="btn-premium bg-red-500 flex-1">حذف</button>
                <button onClick={() =>setDeleteId(null)} className="btn-secondary flex-1">إلغاء</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card-glass rounded-2xl overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث في المنتجات..." className="input-premium w-full pr-10" />
          </div>
          <select value={selectedCategory} onChange={e=>setSelectedCategory(e.target.value)} className="input-premium">
            <option value="all">كل الفئات</option>{categories.map((c: any) => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          <select value={selectedStatus} onChange={e=>setSelectedStatus(e.target.value)} className="input-premium">
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="low_stock">منخفض</option>
            <option value="out_of_stock">نفاد</option>
            <option value="expired">منتهي</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                {<>
                <th className="px-4 py-3 text-right font-medium">{t('products.name')}</th>
                <th className="px-4 py-3 text-right font-medium cursor-pointer" onClick={()=>handleSort('sku')}>{t('products.sku')}</th>
                <th className="px-4 py-3 text-right font-medium">{t('products.category')}</th>
                <th className="px-4 py-3 text-right font-medium cursor-pointer" onClick={()=>handleSort('price')}>{t('products.price')}</th>
                <th className="px-4 py-3 text-right font-medium cursor-pointer" onClick={()=>handleSort('stock')}>{t('products.stock')}</th>
                <th className="px-4 py-3 text-right font-medium">{t('products.status')}</th>
                <th className="px-4 py-3 text-right font-medium"></th>
                </>}
              </tr>
            </thead>
            <tbody>
              {pageItems.map((p: any) => {
                const Icon = getCategoryIcon(p.category);
                return (
                  <tr key={p.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-muted)]">{p.sku}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-teal-50 dark:bg-teal-950 flex items-center justify-center"><Icon className="w-3.5 h-3.5 text-teal-600" /></div><span>{p.category}</span></div></td>
                    <td className="px-4 py-3">{fmt(p.price)} {curr}</td>
                    <td className="px-4 py-3">{fmt(p.stock)}</td>
                    <td className="px-4 py-3"><span className={`badge ${p.status==='active'?'badge-success':p.status==='low_stock'?'badge-warning':'badge-danger'}`}>
                      {p.status==='active'?'نشط':p.status==='low_stock'?'منخفض':p.status==='out_of_stock'?'نفاد':'منتهي'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={()=>{setEditingProduct(p);setShowForm(true);}} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 text-blue-500"><Edit className="w-4 h-4" /></button>
                        <button onClick={()=>setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-red-500"><Trash2 className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900 text-teal-500"><QrCode className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-6 text-center text-sm text-[var(--text-muted)]">لا توجد منتجات</div>}
        </div>

        <div className="p-4 flex items-center justify-between border-t border-[var(--border-subtle)]">
          <span className="text-xs text-[var(--text-muted)]">{filtered.length} منتج</span>
          <div className="flex items-center gap-2">
            <button onClick={()=>setCurrentPage(Math.max(1,currentPage-1))} disabled={currentPage===1} className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm">{currentPage} / {pages}</span>
            <button onClick={()=>setCurrentPage(Math.min(pages,currentPage+1))} disabled={currentPage===pages} className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
