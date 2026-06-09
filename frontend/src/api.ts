const API_BASE = '/api';

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

// ─── Auth ─────────────────────────────────────────────────
export interface LoginPayload { username: string; password: string; account_type?: string }
export interface Token { access_token: string; token_type: string }
export const auth = {
  register: (p: LoginPayload) => req<Token>('/auth/register', { method: 'POST', body: JSON.stringify(p) }),
  login: (p: LoginPayload) => req<Token>('/auth/login', { method: 'POST', body: JSON.stringify(p) }),
  me: () => req<any>('/auth/me'),
};

// ─── Dashboard ─────────────────────────────────────────────
export interface DashboardData {
  kpis: {
    today_sales: number; today_sales_change: number;
    today_transactions: number; today_transactions_change: number;
    low_stock_items: number; low_stock_change: number;
    active_products: number; active_products_change: number;
    total_inventory_value: number; total_inventory_value_change: number;
    expiring_soon: number; expiring_soon_change: number;
    total_expenses: number; total_expenses_change: number;
    employee_count: number; employee_count_change: number;
  };
  weekly_sales: { day: string; sales: number; transactions: number }[];
  category_distribution: { name: string; count: number; value: number; color: string }[];
  transactions: { id: string; type: string; amount: number; item_count: number; date: string; customer?: string }[];
  alerts: { id: string; type: string; title: string; message: string; severity: string; read: boolean; date: string }[];
  expenses: { id: number; category: string; amount: number; date: string }[];
  total_expenses: number;
  employee_count: number;
}
export const dashboard = { get: () => req<DashboardData>('/dashboard') };

// ─── Products ─────────────────────────────────────────────
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
    return req<{ items: Product[]; total: number; pages: number }>(`/products${qs}`);
  },
  create: (p: Omit<Product, 'id' | 'created_at'>) => req<Product>('/products', { method: 'POST', body: JSON.stringify(p) }),
  update: (id: number, p: Partial<Product>) => req<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
  del: (id: number) => req<void>(`/products/${id}`, { method: 'DELETE' }),
};

// ─── Categories ───────────────────────────────────────────
export interface Category { id: number; name: string; icon: string; color: string; count: number; created_at: string }
export const categories = {
  list: () => req<Category[]>('/categories'),
  create: (c: Partial<Category>) => req<Category>('/categories', { method: 'POST', body: JSON.stringify(c) }),
};

// ─── Transactions ─────────────────────────────────────────
export interface Transaction {
  id: number; type: string; amount: number; item_count: number;
  date: string; customer?: string; items: string; payment_method: string; status: string; created_at: string;
}
export const transactions = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return req<Transaction[]>(`/transactions${qs}`);
  },
  create: (t: Omit<Transaction, 'id' | 'date' | 'created_at'>) => req<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(t) }),
  summary: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return req<any>(`/transactions/summary${qs}`);
  },
};

// ─── Alerts ───────────────────────────────────────────────
export interface Alert { id: number; type: string; title: string; message: string; severity: string; product_id?: number; read: boolean; date: string; created_at: string }
export const alerts = {
  list: () => req<Alert[]>('/alerts'),
  markRead: (id: number) => req<void>(`/alerts/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => req<void>('/alerts/read-all', { method: 'PATCH' }),
  del: (id: number) => req<void>(`/alerts/${id}`, { method: 'DELETE' }),
};

// ─── Settings ─────────────────────────────────────────────
export interface StoreSettings {
  store_name: string; store_address: string; store_phone: string;
  store_email: string; store_tax_id: string; store_logo?: string | null;
  email_notifications: boolean; push_notifications: boolean; sms_notifications: boolean;
  low_stock_alert: boolean; expiry_alert: boolean; daily_report: boolean;
  low_stock_threshold: number; expiry_alert_days: number;
  tax_rate: number; receipt_header: string; receipt_footer: string;
  receipt_width: number; auto_print: boolean;
  theme: string; language: string; currency_symbol: string; currency_label: string;
  round_prices: boolean; date_format: string; price_display: string;
}
export const settings = {
  get: () => req<StoreSettings>('/settings'),
  update: (s: Partial<StoreSettings>) => req<StoreSettings>('/settings', { method: 'PUT', body: JSON.stringify(s) }),
};

// ─── Employees ─────────────────────────────────────────────
export interface Employee {
  id: number; name: string; phone: string; email: string;
  role: string; base_salary: number; join_date: string;
  status: string; id_card: string; notes: string; created_at: string;
}
export interface SalaryPayment {
  id: number; employee_id: number; amount: number; month: number; year: number;
  bonus: number; deductions: number; net_salary: number; paid_date: string;
  payment_method: string; status: string; notes: string; created_at: string;
}
export const employees = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return req<Employee[]>(`/employees${qs}`);
  },
  create: (e: Omit<Employee, 'id' | 'created_at'>) => req<Employee>('/employees', { method: 'POST', body: JSON.stringify(e) }),
  update: (id: number, e: Partial<Employee>) => req<Employee>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(e) }),
  del: (id: number) => req<void>(`/employees/${id}`, { method: 'DELETE' }),
  salaryHistory: (id: number) => req<any[]>(`/employees/${id}/salary-history`),
};
export const salaryPayments = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return req<SalaryPayment[]>(`/salary-payments${qs}`);
  },
  create: (p: Omit<SalaryPayment, 'id' | 'paid_date' | 'created_at'>) => req<SalaryPayment>('/salary-payments', { method: 'POST', body: JSON.stringify(p) }),
  update: (id: number, p: Partial<SalaryPayment>) => req<SalaryPayment>(`/salary-payments/${id}`, { method: 'PUT', body: JSON.stringify(p) }),
  del: (id: number) => req<void>(`/salary-payments/${id}`, { method: 'DELETE' }),
};

// ─── Expenses ───────────────────────────────────────────────
export interface Expense {
  id: number; category: string; description: string; amount: number;
  date: string; payment_method: string; receipt_image?: string | null;
  created_by: string; created_at: string;
}
export const expenses = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return req<Expense[]>(`/expenses${qs}`);
  },
  create: (e: Omit<Expense, 'id' | 'created_at'>) => req<Expense>('/expenses', { method: 'POST', body: JSON.stringify(e) }),
  update: (id: number, e: Partial<Expense>) => req<Expense>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(e) }),
  del: (id: number) => req<void>(`/expenses/${id}`, { method: 'DELETE' }),
  summary: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return req<any>(`/expenses/summary${qs}`);
  },
};

// ─── Suppliers ─────────────────────────────────────────────
export interface Supplier {
  id: number; name: string; contact: string; phone: string; email: string;
  address: string; balance: number; status: string; notes: string; created_at: string;
}
export const suppliers = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return req<Supplier[]>(`/suppliers${qs}`);
  },
  create: (s: Omit<Supplier, 'id' | 'created_at'>) => req<Supplier>('/suppliers', { method: 'POST', body: JSON.stringify(s) }),
  update: (id: number, s: Partial<Supplier>) => req<Supplier>(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(s) }),
  del: (id: number) => req<void>(`/suppliers/${id}`, { method: 'DELETE' }),
};

// ─── Customers ─────────────────────────────────────────────
export interface Customer {
  id: number; name: string; phone: string; email: string;
  address: string; credit_limit: number; balance: number;
  status: string; notes: string; created_at: string;
}
export const customers = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return req<Customer[]>(`/customers${qs}`);
  },
  create: (c: Omit<Customer, 'id' | 'created_at'>) => req<Customer>('/customers', { method: 'POST', body: JSON.stringify(c) }),
  update: (id: number, c: Partial<Customer>) => req<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(c) }),
  del: (id: number) => req<void>(`/customers/${id}`, { method: 'DELETE' }),
};

// ─── Employee Expenses (GitHub existing) ─────────────────────
export interface EmployeeExpense {
  id: number; employee_name: string; amount: number; category: string;
  date: string; description: string; status: string; created_at: string;
}
export const employeeExpenses = {
  list: () => req<EmployeeExpense[]>('/employee-expenses'),
  create: (e: Omit<EmployeeExpense, 'id' | 'created_at'>) => req<EmployeeExpense>('/employee-expenses', { method: 'POST', body: JSON.stringify(e) }),
  update: (id: number, e: Partial<EmployeeExpense>) => req<EmployeeExpense>(`/employee-expenses/${id}`, { method: 'PUT', body: JSON.stringify(e) }),
  del: (id: number) => req<void>(`/employee-expenses/${id}`, { method: 'DELETE' }),
  approve: (id: number) => req<void>(`/employee-expenses/${id}/approve`, { method: 'PATCH' }),
  reject: (id: number) => req<void>(`/employee-expenses/${id}/reject`, { method: 'PATCH' }),
};

// ─── Export ───────────────────────────────────────────────
export const backup = {
  export: () => req<any>('/export/json'),
};

export default req;
