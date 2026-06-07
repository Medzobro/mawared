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
    items: str = ""  # comma-separated product IDs
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

# ─── Settings Schemas ──────────────────────────────────────

class StoreSettings(BaseModel):
    store_name: str = "مورد - MAWARED"
    store_address: str = "نواكشوط، موريتانيا"
    store_phone: str = "+222 45 00 00 00"
    email_notifications: bool = True
    push_notifications: bool = True
    sms_notifications: bool = False
    low_stock_alert: bool = True
    expiry_alert: bool = True
    daily_report: bool = False
    theme: Theme = Theme.system
    language: Language = Language.ar
    currency_symbol: str = "MRU"
    currency_label: str = "أوقية"

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

class WeeklySalesItem(BaseModel):
    day: str
    sales: float
    transactions: int

class CategoryDistributionItem(BaseModel):
    name: str
    count: int
    value: int  # percentage
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

class AuditLogOut(BaseModel):
    id: int
    action: str
    entity: str
    entity_id: Optional[int] = None
    user_id: Optional[int] = None
    details: str = ""
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedProducts(BaseModel):
    items: List[ProductOut]
    total: int
    page: int
    pages: int
    limit: int

class DashboardData(BaseModel):
    kpis: DashboardKPIs
    weekly_sales: List[WeeklySalesItem]
    category_distribution: List[CategoryDistributionItem]
    transactions: List[RecentTransactionItem]
    alerts: List[AlertItem]
