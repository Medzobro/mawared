/**
 * MAWARED — QR / Barcode Page
 * - QR generation via qrcode.toCanvas
 * - Barcode generation via jsbarcode (+ dynamic import)
 * - QR scanning via html5-qrcode
 */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toCanvas } from 'qrcode';
import { Html5Qrcode } from 'html5-qrcode';
import { useTranslation } from 'react-i18next';
import {
  QrCode,
  ScanLine,
  Search,
  Printer,
  Download,
  Package,
  ChevronDown,
  Copy,
  Check,
  AlertTriangle,
  Barcode,
  Settings2,
  X,
  RefreshCw,
  Camera,
  CameraOff,
} from 'lucide-react';
import { products } from '../data/demoData';
import type { Product } from '../data/demoData';
import { useOutsideClick } from '../hooks/useOutsideClick';

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

const barcodeFormats = [
  { value: 'CODE128', label: 'Code128' },
  { value: 'EAN13', label: 'EAN-13' },
  { value: 'UPC', label: 'UPC-A' },
];

function isValidForFormat(text: string, format: string): boolean {
  if (format === 'CODE128') return true;
  if (format === 'EAN13') return /^\d{13}$/.test(text);
  if (format === 'UPC') return /^\d{12}$/.test(text);
  return true;
}

export function QrPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'scan'>('generate');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            <span className="text-gradient">QR والباركود</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            توليد ومسح رموز QR والباركود للمنتجات
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] w-fit"
      >
        <button
          onClick={() => setActiveTab('generate')}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'generate'
              ? 'text-teal-600 dark:text-teal-400'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {activeTab === 'generate' && (
            <motion.div
              layoutId="qr-tab-indicator"
              className="absolute inset-0 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            توليد QR
          </span>
        </button>
        <button
          onClick={() => setActiveTab('scan')}
          className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'scan'
              ? 'text-teal-600 dark:text-teal-400'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          {activeTab === 'scan' && (
            <motion.div
              layoutId="qr-tab-indicator"
              className="absolute inset-0 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50"
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <ScanLine className="w-4 h-4" />
            ماسح QR
          </span>
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'generate' ? (
          <GenerateTab key="generate" />
        ) : (
          <ScanTab key="scan" />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────── GenerateTab ─────────────────────────── */

function GenerateTab() {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] ?? null);
  const [comboOpen, setComboOpen] = useState(false);
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
  const [copied, setCopied] = useState(false);
  const comboRef = useRef<HTMLDivElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);

  useOutsideClick(comboRef, () => setComboOpen(false));

  const productList = useMemo(() => {
    if (!search.trim()) return products;
    return products.filter(
      (p) =>
        p.name.includes(search) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.includes(search)
    );
  }, [search]);

  // Generate QR directly on canvas
  useEffect(() => {
    if (!selectedProduct || !qrCanvasRef.current) return;
    const text = selectedProduct.barcode || selectedProduct.sku;
    const canvas = qrCanvasRef.current;
    // Ensure a clean square size
    canvas.width = 400;
    canvas.height = 400;
    toCanvas(canvas, text, {
      width: 400,
      margin: 2,
      color: { dark: '#14b8a6', light: '#ffffff' },
    }).catch(() => {});
  }, [selectedProduct]);

  // Generate barcode using jsbarcode (dynamic import to keep initial bundle light)
  useEffect(() => {
    if (!selectedProduct || !barcodeCanvasRef.current) return;
    const text = selectedProduct.barcode || selectedProduct.sku;
    const canvas = barcodeCanvasRef.current;
    let cancelled = false;

    const render = async () => {
      try {
        const mod: any = await import('jsbarcode');
        const JsBarcode = mod.default || mod;
        if (cancelled) return;
        JsBarcode(canvas, text, {
          format: barcodeFormat,
          width: 2,
          height: 80,
          displayValue: true,
          fontSize: 16,
          lineColor: '#14b8a6',
          background: 'transparent',
          margin: 10,
        });
      } catch {
        if (!cancelled && barcodeFormat !== 'CODE128') {
          try {
            const mod: any = await import('jsbarcode');
            const JsBarcode = mod.default || mod;
            JsBarcode(canvas, text, {
              format: 'CODE128',
              width: 2,
              height: 80,
              displayValue: true,
              fontSize: 16,
              lineColor: '#14b8a6',
              background: 'transparent',
              margin: 10,
            });
          } catch {
            // ignore
          }
        }
      }
    };

    render();
    return () => { cancelled = true; };
  }, [selectedProduct, barcodeFormat]);

  const handlePrint = useCallback(
    async (type: 'qr' | 'barcode') => {
      const win = window.open('', '_blank');
      if (!win) return;
      let img = '';
      if (type === 'qr' && qrCanvasRef.current) {
        img = qrCanvasRef.current.toDataURL('image/png');
      } else if (type === 'barcode' && barcodeCanvasRef.current) {
        img = barcodeCanvasRef.current.toDataURL('image/png');
      }
      const title = type === 'qr' ? 'QR Code' : 'Barcode';
      win.document.write(`
        <html dir="rtl">
          <head><title>${title}</title></head>
          <body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#fff;">
            <img src="${img}" style="max-width:80%;max-height:80%;" />
          </body>
        </html>
      `);
      win.document.close();
      setTimeout(() => win.print(), 300);
    },
    []
  );

  const handleDownload = useCallback(
    (type: 'qr' | 'barcode') => {
      const link = document.createElement('a');
      if (type === 'qr' && qrCanvasRef.current) {
        link.href = qrCanvasRef.current.toDataURL('image/png');
        link.download = `${selectedProduct?.sku || 'qr'}_QR.png`;
      } else if (type === 'barcode' && barcodeCanvasRef.current) {
        link.href = barcodeCanvasRef.current.toDataURL('image/png');
        link.download = `${selectedProduct?.sku || 'barcode'}_BC.png`;
      } else {
        return;
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [selectedProduct]
  );

  const barcodeValid = selectedProduct
    ? isValidForFormat(selectedProduct.barcode || selectedProduct.sku, barcodeFormat)
    : true;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      {/* Controls Column */}
      <motion.div variants={itemVariants} className="space-y-4">
        {/* Product Selector */}
        <div className="card-glass card-glow rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center">
              <Package className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                اختيار المنتج
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                ابحث واختر المنتج المطلوب
              </p>
            </div>
          </div>

          <div ref={comboRef} className="relative">
            <button
              onClick={() => setComboOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] hover:border-[var(--border-medium)] transition-colors"
            >
              <span className="truncate">
                {selectedProduct ? selectedProduct.name : 'اختر منتجاً...'}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${
                  comboOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {comboOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  className="absolute top-full right-0 left-0 mt-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl shadow-black/10 z-40 overflow-hidden"
                >
                  <div className="p-3 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                      <Search className="w-4 h-4 text-[var(--text-muted)]" />
                      <input
                        autoFocus
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="بحث..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                      />
                      {search && (
                        <button onClick={() => setSearch('')}>
                          <X className="w-4 h-4 text-[var(--text-muted)]" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto no-scrollbar">
                    {productList.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
                        لا توجد منتجات مطابقة
                      </div>
                    ) : (
                      productList.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedProduct(p);
                            setComboOpen(false);
                            setSearch('');
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-right transition-colors ${
                            selectedProduct?.id === p.id
                              ? 'bg-teal-50 dark:bg-teal-950/30'
                              : 'hover:bg-[var(--bg-elevated)]'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]">
                            <Barcode className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-[var(--text-muted)]">
                              {p.sku} · {p.barcode}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {selectedProduct.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {selectedProduct.category} · {selectedProduct.price.toFixed(2)} MRU
                  </p>
                </div>
                <span
                  className={`badge ${
                    selectedProduct.status === 'active'
                      ? 'badge-success'
                      : selectedProduct.status === 'low_stock'
                      ? 'badge-warning'
                      : 'badge-danger'
                  }`}
                >
                  {selectedProduct.stock} {selectedProduct.unit}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <p className="text-xs text-[var(--text-muted)] font-mono bg-[var(--bg-primary)] px-2 py-1 rounded-lg border border-[var(--border-subtle)]">
                  {selectedProduct.barcode}
                </p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedProduct.barcode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--bg-primary)] text-[var(--text-muted)] transition-colors"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Barcode Settings */}
        <div className="card-glass card-glow rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                إعدادات الباركود
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                اختر نوع باركود المنتج
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {barcodeFormats.map((f) => (
              <button
                key={f.value}
                onClick={() => setBarcodeFormat(f.value)}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  barcodeFormat === f.value
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400'
                    : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {!barcodeValid && selectedProduct && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-xs text-amber-500"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>
                الباركود غير متوافق مع {barcodeFormats.find((f) => f.value === barcodeFormat)?.label}، جارٍ الانتقال إلى Code128.
              </span>
            </motion.div>
          )}
        </div>

        {/* Barcode Preview */}
        <div className="card-glass card-glow rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              معاينة الباركود
            </h3>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePrint('barcode')}
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="طباعة"
              >
                <Printer className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDownload('barcode')}
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title="تحميل"
              >
                <Download className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
          <div className="flex items-center justify-center p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            {/* Using a fixed size canvas ref directly */}
            <canvas ref={barcodeCanvasRef} className="max-w-full" />
          </div>
        </div>
      </motion.div>

      {/* QR Preview Column */}
      <motion.div variants={itemVariants}>
        <div className="card-glass card-glow rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[420px]">
          {selectedProduct ? (
            <motion.div
              key={selectedProduct.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex flex-col items-center"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative p-6 rounded-2xl bg-white border-4 border-dashed border-[var(--border-medium)]"
              >
                <canvas
                  ref={qrCanvasRef}
                  width={400}
                  height={400}
                  className="w-64 h-64 sm:w-72 sm:h-72 object-contain"
                />
              </motion.div>
              <p className="mt-4 text-lg font-bold text-[var(--text-primary)] text-center">
                {selectedProduct.name}
              </p>
              <p className="text-sm text-[var(--text-muted)] text-center mt-1">
                {selectedProduct.barcode || selectedProduct.sku}
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center text-[var(--text-muted)]">
              <QrCode className="w-16 h-16 mb-3 opacity-20" />
              <p className="text-sm">اختر منتجاً لعرض QR code</p>
            </div>
          )}

          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePrint('qr')}
                className="btn-secondary gap-2"
              >
                <Printer className="w-4 h-4" />
                طباعة
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleDownload('qr')}
                className="btn-premium gap-2"
              >
                <Download className="w-4 h-4" />
                تحميل QR
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────── ScanTab ─────────────────────────── */

function ScanTab() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerId = 'qr-reader';

  const matchedProduct = useMemo(() => {
    if (!scanResult) return null;
    return (
      products.find(
        (p) =>
          p.barcode === scanResult ||
          p.sku.toLowerCase() === scanResult.toLowerCase() ||
          p.name.includes(scanResult)
      ) || null
    );
  }, [scanResult]);

  const startScan = async () => {
    setError(null);
    setScanResult(null);
    try {
      const scanner = new Html5Qrcode(readerId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setScanResult(decodedText);
          stopScan();
        },
        () => {}
      );
      setScanning(true);
    } catch (err: any) {
      setError(
        err?.message || 'فشل الوصول إلى الكاميرا. تأكد من منح الإذن.'
      );
      setScanning(false);
    }
  };

  const stopScan = async () => {
    try {
      await scannerRef.current?.stop();
    } catch {
      // ignore
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      {/* Scanner Column */}
      <motion.div variants={itemVariants}>
        <div className="card-glass card-glow rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
              <ScanLine className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                ماسح QR
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                ضع رمز QR في إطار الكاميرا
              </p>
            </div>
          </div>

          {/* Camera Preview */}
          <div className="relative rounded-xl overflow-hidden bg-black/80 border border-[var(--border-subtle)] aspect-square flex items-center justify-center">
            <div id={readerId} className="w-full h-full" />
            {!scanning && !scanResult && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70">
                <Camera className="w-12 h-12 mb-3 opacity-40" />
                <p className="text-sm">اضغط "بدء المسح" لتفعيل الكاميرا</p>
              </div>
            )}
            {scanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 border-2 border-dashed border-teal-400/60 rounded-2xl" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mt-4">
            {!scanning ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={startScan}
                className="btn-premium flex-1 gap-2"
              >
                <Camera className="w-4 h-4" />
                بدء المسح
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={stopScan}
                className="btn-secondary flex-1 gap-2"
              >
                <CameraOff className="w-4 h-4" />
                إيقاف المسح
              </motion.button>
            )}
            {scanResult && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setScanResult(null);
                  setError(null);
                }}
                className="btn-secondary gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                مسح جديد
              </motion.button>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-xl"
            >
              <AlertTriangle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Results Column */}
      <motion.div variants={itemVariants} className="space-y-4">
        {scanResult ? (
          <>
            {/* Scanned Code */}
            <div className="card-glass card-glow rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  نتيجة المسح
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    navigator.clipboard.writeText(scanResult);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  title="نسخ"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </motion.button>
              </div>
              <div className="px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                <p className="text-sm text-[var(--text-primary)] break-all font-mono">
                  {scanResult}
                </p>
              </div>
            </div>

            {/* Matched Product */}
            <AnimatePresence mode="wait">
              {matchedProduct ? (
                <motion.div
                  key="matched"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="card-glass card-glow rounded-2xl p-5 sm:p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                      <Package className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[var(--text-primary)]">
                        المنتج المطابق
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        تم العثور على منتج مطابق في قاعدة البيانات
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]">
                      <Barcode className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-[var(--text-primary)]">
                        {matchedProduct.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="badge badge-info text-xs">
                          {matchedProduct.sku}
                        </span>
                        <span className="badge badge-muted text-xs">
                          {matchedProduct.category}
                        </span>
                        <span
                          className={`badge text-xs ${
                            matchedProduct.status === 'active'
                              ? 'badge-success'
                              : matchedProduct.status === 'low_stock'
                              ? 'badge-warning'
                              : 'badge-danger'
                          }`}
                        >
                          {matchedProduct.status === 'active'
                            ? 'نشط'
                            : matchedProduct.status === 'low_stock'
                            ? 'منخفض'
                            : 'نفد'}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                          <p className="text-[11px] text-[var(--text-muted)]">السعر</p>
                          <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                            {matchedProduct.price.toFixed(2)} MRU
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                          <p className="text-[11px] text-[var(--text-muted)]">المخزون</p>
                          <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">
                            {matchedProduct.stock} {matchedProduct.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="not-found"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="card-glass card-glow rounded-2xl p-5 sm:p-6 text-center"
                >
                  <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-amber-500 opacity-40" />
                  <p className="text-base font-semibold text-[var(--text-primary)]">
                    لم يتم العثور على منتج مطابق
                  </p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    الرمز الممسوح لا يتطابق مع أي منتج في قاعدة البيانات.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="card-glass card-glow rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
            <ScanLine className="w-14 h-14 text-[var(--text-muted)] opacity-20 mb-4" />
            <p className="text-base font-semibold text-[var(--text-primary)]">
              لا توجد نتائج بعد
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">
              اضغط "بدء المسح" ووجّه الكاميرا نحو رمز QR لإظهار النتائج هنا.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
export default QrPage;
