import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Search, Plus, Minus, Trash2, Receipt, Printer, X,
  CreditCard, Banknote, ArrowRight, ScanBarcode, Package, Calculator,
  User, Phone, Clock, ChevronDown, CheckCircle2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as api from '../api';

interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  barcode?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  barcode?: string;
  category: string;
}

export function POS() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'both'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [cashReceived, setCashReceived] = useState('');
  const [receipt, setReceipt] = useState<any>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.products.list().then((data: any) => {
      const items = Array.isArray(data) ? data : data.items || [];
      setProducts(items.slice(0, 50));
    }).catch(() => setProducts([]));
  }, []);

  const filtered = search.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.includes(search)
      )
    : products;

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1, stock: product.stock, barcode: product.barcode }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.product_id !== id) return i;
      const newQty = Math.max(1, Math.min(i.quantity + delta, i.stock));
      return { ...i, quantity: newQty };
    }).filter(i => i.quantity > 0));
  };

  const removeItem = (id: number) => setCart(prev => prev.filter(i => i.product_id !== id));
  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmount = subtotal * (discount / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (taxRate / 100);
  const total = afterDiscount + taxAmount;
  const change = paymentMethod === 'cash' ? Math.max(0, parseFloat(cashReceived || '0') - total) : 0;

  const handleCheckout = async () => {
    if (!cart.length) return;
    setLoading(true);
    try {
      const res = await api.transactions.create({
        type: 'sale',
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity, price: i.price })),
        total,
        discount: discountAmount,
        tax: taxAmount,
        payment_method: paymentMethod,
        customer_name: customerName || undefined,
        customer_phone: customerPhone || undefined,
      });
      setReceipt({
        ...res,
        items: cart,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total,
        change,
        customerName,
        customerPhone,
        paymentMethod,
        date: new Date().toLocaleString('ar-SA'),
      });
      setCart([]);
      setCheckoutOpen(false);
    } catch (e) {
      alert(t('pos.errorCheckout') || 'Error processing sale');
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => window.print();

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'F9' && cart.length) { e.preventDefault(); setCheckoutOpen(true); }
      if (e.key === 'Escape') { setCheckoutOpen(false); setReceipt(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cart.length]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">{t('pos.title') || 'نقطة البيع'}</h1>
              <p className="text-xs text-[var(--text-muted)]">{t('pos.subtitle') || 'F2: بحث | F9: دفع | Esc: إغلاق'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)]">{cart.length} {t('pos.items') || 'عناصر'}</span>
            <button onClick={clearCart} className="btn-ghost text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Products Panel */}
          <div className="lg:col-span-3 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('pos.searchPlaceholder') || 'ابحث بالاسم أو الباركود... (F2)'}
                className="input-premium w-full pr-10"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
              {filtered.map(p => (
                <motion.button
                  key={p.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => addToCart(p)}
                  className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-teal-500/30 hover:bg-[var(--bg-elevated)] transition-all text-right"
                >
                  <div className="flex items-start justify-between mb-1">
                    <Package className="w-4 h-4 text-[var(--text-muted)]" />
                    <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">
                      {p.stock}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{p.name}</p>
                  <p className="text-sm font-bold text-teal-400 mt-1">{p.price.toLocaleString()} MRU</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Cart Panel */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[var(--text-primary)]">{t('pos.cart') || 'السلة'}</h3>
                <span className="text-xs text-[var(--text-muted)]">{cart.length} {t('pos.items') || 'عناصر'}</span>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-muted)]">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{t('pos.emptyCart') || 'السلة فارغة'}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[35vh] overflow-y-auto">
                  <AnimatePresence>
                    {cart.map(item => (
                      <motion.div
                        key={item.product_id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{(item.price * item.quantity).toLocaleString()} MRU</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateQty(item.product_id, -1)} className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center hover:bg-teal-500/10">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => updateQty(item.product_id, 1)} className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center hover:bg-teal-500/10">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.product_id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-[var(--border-subtle)] pt-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">{t('pos.subtotal') || 'المجموع'}</span>
                  <span className="font-medium">{subtotal.toLocaleString()} MRU</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">{t('pos.discount') || 'الخصم'} ({discount}%)</span>
                  <span className="font-medium text-red-400">-{discountAmount.toLocaleString()} MRU</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-muted)]">{t('pos.tax') || 'الضريبة'} ({taxRate}%)</span>
                  <span className="font-medium">{taxAmount.toLocaleString()} MRU</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-[var(--border-subtle)]">
                  <span className="text-[var(--text-primary)]">{t('pos.total') || 'الإجمالي'}</span>
                  <span className="text-teal-400">{total.toLocaleString()} MRU</span>
                </div>
              </div>

              {/* Discount & Tax Controls */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-[var(--text-muted)]">{t('pos.discount') || 'الخصم %'}</label>
                  <input type="number" min={0} max={100} value={discount} onChange={e => setDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))} className="input-premium w-full text-sm" />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)]">{t('pos.tax') || 'الضريبة %'}</label>
                  <input type="number" min={0} max={100} value={taxRate} onChange={e => setTaxRate(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))} className="input-premium w-full text-sm" />
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => setCheckoutOpen(true)}
                disabled={!cart.length}
                className="btn-premium w-full py-3 gap-2 disabled:opacity-50"
              >
                <Receipt className="w-4 h-4" />
                {t('pos.checkout') || 'إتمام البيع'} (F9)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 w-full max-w-md space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{t('pos.checkout') || 'إتمام البيع'}</h3>
                <button onClick={() => setCheckoutOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[var(--bg-elevated)] flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Customer Info */}
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder={t('pos.customerName') || 'اسم العميل (اختياري)'} className="input-premium w-full pr-10" />
                </div>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder={t('pos.customerPhone') || 'رقم الهاتف (اختياري)'} className="input-premium w-full pr-10" />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('pos.paymentMethod') || 'طريقة الدفع'}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['cash', 'card', 'both'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2 rounded-xl border text-sm font-medium transition-all ${
                        paymentMethod === m
                          ? 'border-teal-500 bg-teal-500/10 text-teal-400'
                          : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]'
                      }`}
                    >
                      {m === 'cash' && <Banknote className="w-4 h-4 mx-auto mb-1" />}
                      {m === 'card' && <CreditCard className="w-4 h-4 mx-auto mb-1" />}
                      {m === 'both' && <Calculator className="w-4 h-4 mx-auto mb-1" />}
                      {t(`pos.${m}`) || m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cash Input */}
              {paymentMethod === 'cash' && (
                <div>
                  <label className="text-sm font-medium">{t('pos.cashReceived') || 'المبلغ المستلم'}</label>
                  <input
                    type="number"
                    value={cashReceived}
                    onChange={e => setCashReceived(e.target.value)}
                    className="input-premium w-full text-lg font-bold"
                    placeholder={total.toString()}
                  />
                  {change > 0 && (
                    <p className="text-sm text-teal-400 mt-1">
                      {t('pos.change') || 'الباقي'}: {change.toLocaleString()} MRU
                    </p>
                  )}
                </div>
              )}

              {/* Total */}
              <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/20 text-center">
                <p className="text-xs text-[var(--text-muted)]">{t('pos.total') || 'الإجمالي'}</p>
                <p className="text-2xl font-bold text-teal-400">{total.toLocaleString()} MRU</p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || (paymentMethod === 'cash' && parseFloat(cashReceived || '0') < total)}
                className="btn-premium w-full py-3 gap-2"
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-5 h-5 rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> {t('pos.confirm') || 'تأكيد البيع'}</>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {receipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white text-black rounded-2xl p-6 w-full max-w-sm space-y-4 print:shadow-none"
              id="receipt-print"
            >
              <div className="text-center border-b border-dashed border-gray-300 pb-4">
                <img src="/logo-brand.jpg" alt="MAWARED" className="w-16 h-16 mx-auto mb-2 rounded-lg object-cover" />
                <h3 className="text-lg font-bold">مـورد | MAWARED</h3>
                <p className="text-xs text-gray-500">{receipt.date}</p>
                <p className="text-xs text-gray-500">{receipt.id ? `رقم: ${receipt.id}` : ''}</p>
              </div>

              <div className="space-y-1 text-sm">
                {receipt.items.map((item: CartItem) => (
                  <div key={item.product_id} className="flex justify-between">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-medium">{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-300 pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span>المجموع</span><span>{receipt.subtotal.toLocaleString()}</span></div>
                {receipt.discount > 0 && <div className="flex justify-between text-red-600"><span>الخصم</span><span>-{receipt.discount.toLocaleString()}</span></div>}
                {receipt.tax > 0 && <div className="flex justify-between"><span>الضريبة</span><span>{receipt.tax.toLocaleString()}</span></div>}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-dashed border-gray-300">
                  <span>الإجمالي</span>
                  <span>{receipt.total.toLocaleString()} MRU</span>
                </div>
                {receipt.change > 0 && <div className="flex justify-between text-teal-600"><span>الباقي</span><span>{receipt.change.toLocaleString()}</span></div>}
              </div>

              <div className="text-center text-xs text-gray-500 border-t border-dashed border-gray-300 pt-3">
                <p>شكراً لتعاملكم معنا</p>
                <p>MAWARED — نظام إدارة المحلات الذكي</p>
              </div>

              <div className="flex gap-2 print:hidden">
                <button onClick={printReceipt} className="flex-1 btn-premium py-2 gap-2">
                  <Printer className="w-4 h-4" /> طباعة
                </button>
                <button onClick={() => setReceipt(null)} className="flex-1 btn-ghost py-2">
                  إغلاق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default POS;
