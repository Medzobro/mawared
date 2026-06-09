from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

# ─── Enums ────────────────────────────────────────────────────

class AppMode(str, Enum):
    shop = "shop"
    pharmacy = "pharmacy"

class Theme(str, Enum):
    light = "light"
    dark = "dark"
    system = "system"

class Language(str, Enum):
    ar = "ar"
    en = "en"
    fr = "fr"

class ProductStatus(str, Enum):
    active = "active"
    low_stock = "low_stock"
    out_of_stock = "out_of_stock"
    expired = "expired"

class TransactionType(str, Enum):
    sale = "sale"
    purchase = "purchase"
    return_ = "return"
    adjustment = "adjustment"

class PaymentMethod(str, Enum):
    cash = "cash"
    card = "card"
    online = "online"

class TransactionStatus(str, Enum):
    completed = "completed"
    pending = "pending"
    cancelled = "cancelled"

class AlertType(str, Enum):
    low_stock = "low_stock"
    expiry = "expiry"
    return_ = "return"
    system = "system"

class AlertSeverity(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class EmployeeRole(str, Enum):
    admin = "admin"
    manager = "manager"
    cashier = "cashier"
    pharmacist = "pharmacist"

class EmployeeStatus(str, Enum):
    active = "active"
    inactive = "inactive"

class ExpenseCategory(str, Enum):
    general = "general"
    rent = "rent"
    utilities = "utilities"
    salaries = "salaries"
    inventory = "inventory"
    marketing = "marketing"
    maintenance = "maintenance"
    transport = "transport"
    other = "other"

# ─── User Schemas ─────────────────────────────────────────────

class UserBase(BaseModel):
    username: str
    name: Optional[str] = None
    role: Optional[str] = "user"
    account_type: AppMode = AppMode.shop

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    username: str
    password: str

class AccountTypeRequest(BaseModel):
    username: str
    password: str
    account_type: str = "shop"

# ─── Category Schemas ────────────────────────────────────────

class CategoryBase(BaseModel):
    name: str
    icon: str = "Package"
    color: str = "#14b8a6"

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

# ─── Product Schemas ────────────────────────────────────────

class ProductBase(BaseModel):
    name: str
    sku: str
    barcode: str
    category: str
    price: float
    cost: float
    stock: int
    min_stock: int = 10
    unit: str = "piece"
    image: Optional[str] = None
    expiry_date: Optional[str] = None
    is_pharmacy: bool = False
    prescription: bool = False
    supplier: str = ""
    status: ProductStatus = ProductStatus.active

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    cost: Optional[float] = None
    stock: Optional[int] = None
    min_stock: Optional[int] = None
    unit: Optional[str] = None
    expiry_date: Optional[str] = None
    supplier: Optional[str] = None
    status: Optional[ProductStatus] = None
    prescription: Optional[bool] = None

class ProductOut(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ─── Transaction Schemas ────────────────────────────────────

class TransactionBase(BaseModel):
    type: TransactionType
    amount: float
    item_count: int = 1
    customer: Optional[str] = None
    items: str = ""
    payment_method: PaymentMethod = PaymentMethod.cash
    status: TransactionStatus = TransactionStatus.completed

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(TransactionBase):
    id: int
    date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# ─── Alert Schemas ─────────────────────────────────────────

class AlertBase(BaseModel):
    type: AlertType
    title: str
    message: str
    severity: AlertSeverity
    product_id: Optional[int] = None
    read: bool = False

class AlertCreate(AlertBase):
    pass

class AlertOut(AlertBase):
    id: int
    date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# ─── Store Settings Schemas ──────────────────────────────────────

class StoreSettings(BaseModel):
    store_name: str = "مورد - MAWARED"
    store_address: str = "نواكشوط، موريتانيا"
    store_phone: str = "+222 45 00 00 00"
    store_email: str = ""
    store_tax_id: str = ""
    store_logo: Optional[str] = None
    email_notifications: bool = True
    push_notifications: bool = True
    sms_notifications: bool = False
    low_stock_alert: bool = True
    expiry_alert: bool = True
    daily_report: bool = False
    low_stock_threshold: int = 10
    expiry_alert_days: int = 30
    tax_rate: float = 0.0
    receipt_header: str = ""
    receipt_footer: str = "شكراً لتعاملكم معنا"
    receipt_width: int = 80
    auto_print: bool = False
    theme: Theme = Theme.system
    language: Language = Language.ar
    currency_symbol: str = "MRU"
    currency_label: str = "أوقية"
    round_prices: bool = False
    date_format: str = "DD/MM/YYYY"
    price_display: str = "cost"

# ─── Employee Schemas ────────────────────────────────────────

class EmployeeBase(BaseModel):
    name: str
    phone: str = ""
    email: str = ""
    role: EmployeeRole = EmployeeRole.cashier
    base_salary: float = 0.0
    join_date: str = ""
    status: EmployeeStatus = EmployeeStatus.active
    id_card: str = ""
    notes: str = ""

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    role: Optional[EmployeeRole] = None
    base_salary: Optional[float] = None
    join_date: Optional[str] = None
    status: Optional[EmployeeStatus] = None
    id_card: Optional[str] = None
    notes: Optional[str] = None

class EmployeeOut(EmployeeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ─── Salary Payment Schemas ──────────────────────────────────

class SalaryPaymentBase(BaseModel):
    employee_id: int
    amount: float = 0.0
    month: int = 1
    year: int = 2026
    bonus: float = 0.0
    deductions: float = 0.0
    net_salary: float = 0.0
    payment_method: PaymentMethod = PaymentMethod.cash
    status: str = "paid"
    notes: str = ""

class SalaryPaymentCreate(SalaryPaymentBase):
    pass

class SalaryPaymentUpdate(BaseModel):
    amount: Optional[float] = None
    bonus: Optional[float] = None
    deductions: Optional[float] = None
    net_salary: Optional[float] = None
    payment_method: Optional[PaymentMethod] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class SalaryPaymentOut(SalaryPaymentBase):
    id: int
    paid_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# ─── Expense Schemas ────────────────────────────────────────

class ExpenseBase(BaseModel):
    category: str = "general"
    description: str = ""
    amount: float = 0.0
    date: str = ""
    payment_method: PaymentMethod = PaymentMethod.cash
    receipt_image: Optional[str] = None
    created_by: str = ""

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[str] = None
    payment_method: Optional[PaymentMethod] = None
    receipt_image: Optional[str] = None
    created_by: Optional[str] = None

class ExpenseOut(ExpenseBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ExpenseSummary(BaseModel):
    total: float
    count: int
    by_category: List[dict]

# ─── Supplier Schemas ───────────────────────────────────────

class SupplierBase(BaseModel):
    name: str
    contact: str = ""
    phone: str = ""
    email: str = ""
    address: str = ""
    balance: float = 0.0
    status: str = "active"
    notes: str = ""

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    balance: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class SupplierOut(SupplierBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ─── Customer Schemas ───────────────────────────────────────

class CustomerBase(BaseModel):
    name: str
    phone: str = ""
    email: str = ""
    address: str = ""
    credit_limit: float = 0.0
    balance: float = 0.0
    status: str = "active"
    notes: str = ""

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    credit_limit: Optional[float] = None
    balance: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class CustomerOut(CustomerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# ─── Dashboard Schemas ─────────────────────────────────────

class DashboardKPIs(BaseModel):
    today_sales: float
    today_sales_change: float
    today_transactions: int
    today_transactions_change: float
    low_stock_items: int
    low_stock_change: float
    active_products: int
    active_products_change: float
    total_inventory_value: float
    total_inventory_value_change: float
    expiring_soon: int
    expiring_soon_change: float
    total_expenses: float
    total_expenses_change: float
    employee_count: int
    employee_count_change: float

class WeeklySalesItem(BaseModel):
    day: str
    sales: float
    transactions: int

class CategoryDistributionItem(BaseModel):
    name: str
    count: int
    value: int
    color: str

class RecentTransactionItem(BaseModel):
    id: str
    type: str
    amount: float
    item_count: int
    date: str
    customer: Optional[str] = None

class AlertItem(BaseModel):
    id: str
    type: str
    title: str
    message: str
    severity: str
    read: bool
    date: str

class ExpenseItem(BaseModel):
    id: int
    category: str
    amount: float
    date: str

class DashboardData(BaseModel):
    kpis: DashboardKPIs
    weekly_sales: List[WeeklySalesItem]
    category_distribution: List[CategoryDistributionItem]
    transactions: List[RecentTransactionItem]
    alerts: List[AlertItem]
    expenses: List[ExpenseItem]
    total_expenses: float
    employee_count: int
