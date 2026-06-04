const API_BASE = 'http://localhost:8080/api';

// ─── Generic request wrapper ────────────────────────────────────────────

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const token = localStorage.getItem('mawared_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts?.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

// ─── Auth ───────────────────────────────────────────────────────────────

export interface LoginPayload { username: string; password: string }
export interface Token { access_token: string; token_type: string }

export const auth = {
  register: (p: LoginPayload) => req<Token>('/auth/register', { method: 'POST', body: JSON.stringify(p) }),
  login: (p: LoginPayload) => req<Token>('/auth/login', { method: 'POST', body: JSON.stringify(p) }),
  me: () => req<any>('/auth/me'),
};

// ─── Dashboard ────────────────────────────────────────────────────────

export interface DashboardData {
  kpis: {
    today_sales: number; today_sales_change: number;
    today_transactions: number; today_transactions_change: number;
    low_stock_items: number; low_stock_change: number;
    active_products: number; active_products_change: number;
    total_inventory_value: number; total_inventory_value_change: number;
    expiring_soon: number; expiring_soon_change: number;
  };
  weekly_sales: { day: string; sales: number; transactions: number }[];
  category_distribution: { name: string; count: number; value: number; color: string }[];
  transactions: { id: string; type: string; amount: number; item_count: number; date: string; customer?: string }[];
  alerts: { id: string; type: string; title: string; message: string; severity: string; read: boolean; date: string }[];
}

export const dashboard = {
  get: () => req<DashboardData>('/dashboard'),
};

// ─── Products ───────────────────────────────────────────────────────────

export interface Product {
  id: number; name: string; sku: string; barcode: string; category: string;
  price: number; cost: number; stock: number; min_stock: number; unit: string;
  image?: string; expiry_date?: string; is_pharmacy: boolean;
  prescription: boolean; supplier: string; status: string;
  created_at: string;
}

export const products = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return req<Product[]>(`/products${qs}`);
  },
  create: (p: Omit<Product, 'id' | 'created_at'>) => req<Product>('/products', { method: 'POST', body: JSON.stringify(p) }),
  update: (id: number, p: Partial<Product>) => req<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
  del: (id: number) => req<void>(`/products/${id}`, { method: 'DELETE' }),
};

// ─── Categories ───────────────────────────────────────────────────────

export interface Category {
  id: number; name: string; icon: string; color: string; count: number; created_at: string;
}

export const categories = {
  list: () => req<Category[]>('/categories'),
  create: (c: Partial<Category>) => req<Category>('/categories', { method: 'POST', body: JSON.stringify(c) }),
};

// ─── Transactions ───────────────────────────────────────────────────────

export interface Transaction {
  id: number; type: string; amount: number; item_count: number;
  date: string; customer?: string; items: string; payment_method: string; status: string; created_at: string;
}

export const transactions = {
  list: () => req<Transaction[]>('/transactions'),
  create: (t: Omit<Transaction, 'id' | 'date' | 'created_at'>) => req<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(t) }),
};

// ─── Alerts ───────────────────────────────────────────────────────────

export interface Alert {
  id: number; type: string; title: string; message: string; severity: string; product_id?: number; read: boolean; date: string; created_at: string;
}

export const alerts = {
  list: () => req<Alert[]>('/alerts'),
  markRead: (id: number) => req<void>(`/alerts/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => req<void>('/alerts/read-all', { method: 'PATCH' }),
  del: (id: number) => req<void>(`/alerts/${id}`, { method: 'DELETE' }),
};

// ─── Settings ───────────────────────────────────────────────────────────

export interface StoreSettings {
  store_name: string;
  store_address: string;
  store_phone: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  low_stock_alert: boolean;
  expiry_alert: boolean;
  daily_report: boolean;
  theme: string;
  language: string;
  currency_symbol: string;
  currency_label: string;
}

export const settings = {
  get: () => req<StoreSettings>('/settings'),
  update: (s: Partial<StoreSettings>) => req<StoreSettings>('/settings', { method: 'PUT', body: JSON.stringify(s) }),
};

export default req;
