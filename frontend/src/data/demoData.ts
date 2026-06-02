export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  image?: string;
  expiryDate?: string;
  isPharmacy: boolean;
  prescription?: boolean;
  supplier: string;
  status: 'active' | 'low_stock' | 'out_of_stock' | 'expired';
}

export interface Category {
  id: string;
  name: string;
  count: number;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: 'sale' | 'purchase' | 'return' | 'adjustment';
  amount: number;
  itemCount: number;
  date: string;
  customer?: string;
  items: string[];
  paymentMethod: 'cash' | 'card' | 'online';
  status: 'completed' | 'pending' | 'cancelled';
}

export interface Alert {
  id: string;
  type: 'low_stock' | 'expiry' | 'return' | 'system';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  productId?: string;
  date: string;
  read: boolean;
}

export const products: Product[] = [
  {
    id: '1', name: 'باراسيتامول 500 مجم', sku: 'PAR-500', barcode: '1234567890123',
    category: 'مسكنات الألم', price: 15.5, cost: 8.2, stock: 120, minStock: 20,
    unit: 'شريط', isPharmacy: true, prescription: false, supplier: 'شركة الدواء',
    status: 'active', expiryDate: '2026-12-01',
  },
  {
    id: '2', name: 'أموكسيسيلين 500 مجم', sku: 'AMX-500', barcode: '1234567890124',
    category: 'مضادات حيوية', price: 35, cost: 18, stock: 45, minStock: 15,
    unit: 'علبة', isPharmacy: true, prescription: true, supplier: 'صيدلية المركز',
    status: 'active', expiryDate: '2026-06-15',
  },
  {
    id: '3', name: 'فيتامين سي 1000 مجم', sku: 'VIT-C1K', barcode: '1234567890125',
    category: 'فيتامينات', price: 42, cost: 22, stock: 200, minStock: 30,
    unit: 'علبة', isPharmacy: true, prescription: false, supplier: 'نيوترامكس',
    status: 'active', expiryDate: '2027-02-28',
  },
  {
    id: '4', name: 'ميزولاست 10 مجم', sku: 'MIZ-10', barcode: '1234567890126',
    category: 'مضادات الهيستامين', price: 28, cost: 14.5, stock: 8, minStock: 10,
    unit: 'شريط', isPharmacy: true, prescription: true, supplier: 'شركة الدواء',
    status: 'low_stock', expiryDate: '2026-09-20',
  },
  {
    id: '5', name: 'ماءoxygen 500 مل', sku: 'H2O-500', barcode: '1234567890127',
    category: 'مياه', price: 2.5, cost: 1.2, stock: 0, minStock: 50,
    unit: 'زجاجة', isPharmacy: false, supplier: 'مياه النقاء',
    status: 'out_of_stock',
  },
  {
    id: '6', name: 'معجون أسنان فلورايد', sku: 'TP-FLO', barcode: '1234567890128',
    category: 'عناية شخصية', price: 18, cost: 9.5, stock: 85, minStock: 20,
    unit: 'عبوة', isPharmacy: false, supplier: 'كولجيت الشرق الأوسط',
    status: 'active', expiryDate: '2027-05-10',
  },
  {
    id: '7', name: 'مسكن بروفين 400 مجم', sku: 'IBU-400', barcode: '1234567890129',
    category: 'مسكنات الألم', price: 22, cost: 11, stock: 95, minStock: 25,
    unit: 'شريط', isPharmacy: true, prescription: false, supplier: 'نوفارتس',
    status: 'active', expiryDate: '2026-11-30',
  },
  {
    id: '8', name: 'كريم مرطب 100 مل', sku: 'CRM-MOI', barcode: '1234567890130',
    category: 'عناية بالبشرة', price: 55, cost: 28, stock: 32, minStock: 10,
    unit: 'عبوة', isPharmacy: false, supplier: 'بيزلين',
    status: 'active', expiryDate: '2028-01-15',
  },
  {
    id: '9', name: 'لوراتادين 10 مجم', sku: 'LOR-10', barcode: '1234567890131',
    category: 'مضادات الهيستامين', price: 19.5, cost: 10, stock: 0, minStock: 15,
    unit: 'شريط', isPharmacy: true, prescription: false, supplier: 'شركة الدواء',
    status: 'out_of_stock', expiryDate: '2026-03-01',
  },
  {
    id: '10', name: 'أوميغا 3 أقراص', sku: 'OMG-3', barcode: '1234567890132',
    category: 'فيتامينات', price: 75, cost: 38, stock: 60, minStock: 12,
    unit: 'علبة', isPharmacy: true, prescription: false, supplier: 'نيوترامكس',
    status: 'active', expiryDate: '2027-08-20',
  },
  {
    id: '11', name: 'شامبو ضد القشرة', sku: 'SHAM-DDR', barcode: '1234567890133',
    category: 'عناية شخصية', price: 32, cost: 16, stock: 5, minStock: 10,
    unit: 'عبوة', isPharmacy: false, supplier: 'هيد أند شولدرز',
    status: 'low_stock',
  },
  {
    id: '12', name: 'مضاد حموضة', sku: 'ANT-ACD', barcode: '1234567890134',
    category: 'هضم ومعدة', price: 14, cost: 7, stock: 78, minStock: 15,
    unit: 'علبة', isPharmacy: true, prescription: false, supplier: 'جلاكوسو',
    status: 'active', expiryDate: '2026-10-10',
  },
];

export const categories: Category[] = [
  { id: '1', name: 'مسكنات الألم', count: 2, icon: 'Pill', color: '#14b8a6' },
  { id: '2', name: 'مضادات حيوية', count: 1, icon: 'ShieldCheck', color: '#f59e0b' },
  { id: '3', name: 'فيتامينات', count: 2, icon: 'Sun', color: '#22c55e' },
  { id: '4', name: 'مضادات الهيستامين', count: 2, icon: 'Wind', color: '#a855f7' },
  { id: '5', name: 'عناية شخصية', count: 3, icon: 'Sparkles', color: '#ec4899' },
  { id: '6', name: 'هضم ومعدة', count: 1, icon: 'Flame', color: '#ef4444' },
  { id: '7', name: 'عناية بالبشرة', count: 1, icon: 'Droplets', color: '#3b82f6' },
  { id: '8', name: 'مياه ومشروبات', count: 1, icon: 'CupSoda', color: '#06b6d4' },
];

export const transactions: Transaction[] = [
  { id: 'TRX-001', type: 'sale', amount: 157.5, itemCount: 5, date: '2026-06-01T10:30:00', customer: 'أحمد محمد', items: ['باراسيتامول 500 مجم', 'فيتامين سي 1000 مجم'], paymentMethod: 'cash', status: 'completed' },
  { id: 'TRX-002', type: 'purchase', amount: 2400, itemCount: 120, date: '2026-06-01T09:15:00', items: ['باراسيتامول 500 مجم', 'أموكسيسيلين 500 مجم'], paymentMethod: 'card', status: 'completed' },
  { id: 'TRX-003', type: 'sale', amount: 63, itemCount: 3, date: '2026-06-01T14:20:00', customer: 'سارة علي', items: ['مسكن بروفين 400 مجم'], paymentMethod: 'cash', status: 'completed' },
  { id: 'TRX-004', type: 'return', amount: 42, itemCount: 1, date: '2026-05-31T16:45:00', customer: 'خالد عبدالله', items: ['فيتامين سي 1000 مجم'], paymentMethod: 'cash', status: 'completed' },
  { id: 'TRX-005', type: 'sale', amount: 228, itemCount: 2, date: '2026-05-31T11:00:00', customer: 'نورة سالم', items: ['كريم مرطب 100 مل'], paymentMethod: 'online', status: 'completed' },
  { id: 'TRX-006', type: 'purchase', amount: 1800, itemCount: 80, date: '2026-05-30T08:30:00', items: ['معجون أسنان فلورايد', 'شامبو ضد القشرة'], paymentMethod: 'card', status: 'completed' },
  { id: 'TRX-007', type: 'adjustment', amount: -28, itemCount: 1, date: '2026-05-29T13:10:00', items: ['لوراتادين 10 مجم'], paymentMethod: 'cash', status: 'pending' },
  { id: 'TRX-008', type: 'sale', amount: 89.5, itemCount: 4, date: '2026-05-29T10:00:00', customer: 'فهد سليمان', items: ['أوميغا 3 أقراص'], paymentMethod: 'cash', status: 'completed' },
  { id: 'TRX-009', type: 'sale', amount: 14, itemCount: 1, date: '2026-05-28T15:30:00', customer: 'لمياء حسن', items: ['مضاد حموضة'], paymentMethod: 'online', status: 'completed' },
  { id: 'TRX-010', type: 'purchase', amount: 3200, itemCount: 200, date: '2026-05-28T09:00:00', items: ['أوميغا 3 أقراص', 'فيتامين سي 1000 مجم'], paymentMethod: 'card', status: 'completed' },
];

export const alerts: Alert[] = [
  { id: 'ALT-001', type: 'low_stock', title: 'نفاد المخزون الوشيك', message: 'منتج ميزولاست 10 مجم وصل للحد الأدنى (8 قطعة)', severity: 'high', productId: '4', date: '2026-06-01T08:00:00', read: false },
  { id: 'ALT-002', type: 'expiry', title: 'منتجات قاربة على الانتهاء', message: 'لوراتادين 10 مجم تاريخ الانتهاء 2026-03-01', severity: 'high', productId: '9', date: '2026-06-01T08:00:00', read: false },
  { id: 'ALT-003', type: 'low_stock', title: 'نفاد المخزون', message: 'شامبو ضد القشرة وصل للحد الأدنى (5 قطعة)', severity: 'medium', productId: '11', date: '2026-05-31T10:00:00', read: false },
  { id: 'ALT-004', type: 'return', title: 'طلب إرجاع جديد', message: 'طلب إرجاع #TRX-004 من خالد عبدالله بقيمة 42 ريال', severity: 'low', date: '2026-05-31T16:45:00', read: true },
  { id: 'ALT-005', type: 'system', title: 'نسخة احتياطية ناجحة', message: 'تم إنشاء نسخة احتياطية تلقائية بنجاح', severity: 'low', date: '2026-05-30T02:00:00', read: true },
  { id: 'ALT-006', type: 'expiry', title: 'تنبيه صلاحية', message: 'أموكسيسيلين 500 مجم ينتهي خلال 6 أشهر', severity: 'medium', productId: '2', date: '2026-05-29T09:00:00', read: true },
];

export const dashboardKPIS = {
  todaySales: { value: 15750, change: 12.5, label: 'مبيعات اليوم' },
  todayTransactions: { value: 42, change: 8.3, label: 'عدد المعاملات' },
  lowStockItems: { value: 5, change: -2, label: 'منتجات منخفضة' },
  activeProducts: { value: 1240, change: 5.1, label: 'المنتجات النشطة' },
  totalInventoryValue: { value: 128500, change: 3.2, label: 'قيمة المخزون' },
  expiringSoon: { value: 12, change: 0, label: 'تنتهي قريباً' },
};

export const CURRENCY_SYMBOL = 'MRU';
export const CURRENCY_LABEL = 'أوقية';

export const weeklySales = [
  { day: 'السبت', sales: 12500, transactions: 38 },
  { day: 'الأحد', sales: 14200, transactions: 45 },
  { day: 'الإثنين', sales: 11800, transactions: 36 },
  { day: 'الثلاثاء', sales: 16500, transactions: 52 },
  { day: 'الأربعاء', sales: 13200, transactions: 41 },
  { day: 'الخميس', sales: 18900, transactions: 58 },
  { day: 'الجمعة', sales: 20400, transactions: 64 },
];

export const categoryDistribution = [
  { name: 'مسكنات الألم', value: 22, color: '#14b8a6' },
  { name: 'مضادات حيوية', value: 15, color: '#f59e0b' },
  { name: 'فيتامينات', value: 18, color: '#22c55e' },
  { name: 'عناية شخصية', value: 25, color: '#ec4899' },
  { name: 'أخرى', value: 20, color: '#a855f7' },
];
