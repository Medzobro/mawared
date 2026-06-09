from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

Base = declarative_base()

DB_PATH = os.path.join(os.path.dirname(__file__), "mawared.db")
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    name = Column(String, nullable=True)
    role = Column(String, default="user")
    account_type = Column(String, default="shop")
    password_hash = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    icon = Column(String, default="Package")
    color = Column(String, default="#14b8a6")
    count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    sku = Column(String, unique=True, index=True)
    barcode = Column(String, unique=True, index=True)
    category = Column(String, index=True)
    price = Column(Float)
    cost = Column(Float)
    stock = Column(Integer, default=0)
    min_stock = Column(Integer, default=10)
    unit = Column(String, default="piece")
    image = Column(String, nullable=True)
    expiry_date = Column(String, nullable=True)  # YYYY-MM-DD
    is_pharmacy = Column(Boolean, default=False)
    prescription = Column(Boolean, default=False)
    supplier = Column(String, default="")
    status = Column(String, default="active")  # active, low_stock, out_of_stock, expired
    created_at = Column(DateTime, default=datetime.utcnow)

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)  # sale, purchase, return, adjustment
    amount = Column(Float)
    item_count = Column(Integer, default=1)
    date = Column(DateTime, default=datetime.utcnow)
    customer = Column(String, nullable=True)
    items = Column(Text, default="")
    payment_method = Column(String, default="cash")
    status = Column(String, default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)  # low_stock, expiry, return, system
    title = Column(String)
    message = Column(Text)
    severity = Column(String)  # low, medium, high
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    read = Column(Boolean, default=False)
    date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class StoreSettings(Base):
    __tablename__ = "store_settings"
    id = Column(Integer, primary_key=True)
    store_name = Column(String, default="مورد - MAWARED")
    store_address = Column(String, default="نواكشوط، موريتانيا")
    store_phone = Column(String, default="+222 45 00 00 00")
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=False)
    low_stock_alert = Column(Boolean, default=True)
    expiry_alert = Column(Boolean, default=True)
    daily_report = Column(Boolean, default=False)
    theme = Column(String, default="system")
    language = Column(String, default="ar")
    currency_symbol = Column(String, default="MRU")
    currency_label = Column(String, default="أوقية")
    updated_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, index=True)  # create, update, delete, login, export, etc.
    entity = Column(String, index=True)  # product, category, transaction, etc.
    entity_id = Column(Integer, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    details = Column(Text, default="")
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, default="other")
    date = Column(String, nullable=False)  # YYYY-MM-DD
    description = Column(Text, default="")
    payment_method = Column(String, default="cash")  # cash, card, online
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, default="")
    email = Column(String, default="")
    role = Column(String, default="cashier")
    base_salary = Column(Float, default=0.0)
    join_date = Column(String, default="")
    status = Column(String, default="active")
    id_card = Column(String, default="")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

class SalaryPayment(Base):
    __tablename__ = "salary_payments"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    amount = Column(Float, default=0.0)
    month = Column(Integer, default=1)
    year = Column(Integer, default=2026)
    bonus = Column(Float, default=0.0)
    deductions = Column(Float, default=0.0)
    net_salary = Column(Float, default=0.0)
    paid_date = Column(DateTime, default=datetime.utcnow)
    payment_method = Column(String, default="cash")
    status = Column(String, default="paid")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    contact = Column(String, default="")
    phone = Column(String, default="")
    email = Column(String, default="")
    address = Column(String, default="")
    balance = Column(Float, default=0.0)
    status = Column(String, default="active")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, default="")
    email = Column(String, default="")
    address = Column(String, default="")
    credit_limit = Column(Float, default=0.0)
    balance = Column(Float, default=0.0)
    status = Column(String, default="active")
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

class EmployeeExpense(Base):
    __tablename__ = "employee_expenses"
    id = Column(Integer, primary_key=True, index=True)
    employee_name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, default="other")
    date = Column(String, nullable=False)  # YYYY-MM-DD
    description = Column(Text, default="")
    status = Column(String, default="pending")  # pending, approved, rejected
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

def get_db():
    """Dependency to get DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)
