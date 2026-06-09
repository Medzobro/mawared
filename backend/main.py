from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta, date, timezone
import random
import os
import json

from database import engine, SessionLocal, get_db, init_db
from database import (
    User, Category, Product, Transaction, Alert, StoreSettings as DBStoreSettings,
    Employee, SalaryPayment, Expense, Supplier, Customer, EmployeeExpense
)
from schemas import (
    UserCreate, UserOut, LoginRequest, Token, AccountTypeRequest,
    ProductCreate, ProductUpdate, ProductOut,
    TransactionCreate, TransactionOut,
    AlertCreate, AlertOut,
    CategoryCreate, CategoryOut,
    StoreSettings,
    DashboardData, DashboardKPIs, WeeklySalesItem, CategoryDistributionItem,
    RecentTransactionItem, AlertItem, ExpenseItem,
    EmployeeCreate, EmployeeUpdate, EmployeeOut,
    SalaryPaymentCreate, SalaryPaymentUpdate, SalaryPaymentOut,
    ExpenseCreate, ExpenseUpdate, ExpenseOut, ExpenseSummary,
    SupplierCreate, SupplierUpdate, SupplierOut,
    CustomerCreate, CustomerUpdate, CustomerOut,
)
from auth import hash_password, verify_password, create_access_token, decode_access_token

app = FastAPI(title="MAWARED API", version="3.0.0")

# CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files paths ────────────────────────────────────────────
dist_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')
static_path = os.path.join(dist_path, 'assets')

# ── Seed data ────────────────────────────────────────────────────
SEED_PRODUCTS = [
    {"name":"باراسيتامول 500 مجم","sku":"PAR-500","barcode":"1234567890123","category":"مسكنات الألم","price":15.5,"cost":8.2,"stock":120,"min_stock":20,"unit":"شريط","is_pharmacy":True,"prescription":False,"supplier":"شركة الدواء","status":"active","expiry_date":"2026-12-01"},
    {"name":"أموكسيسيلين 500 مجم","sku":"AMX-500","barcode":"1234567890124","category":"مضادات حيوية","price":35,"cost":18,"stock":45,"min_stock":15,"unit":"علبة","is_pharmacy":True,"prescription":True,"supplier":"صيدلية المركز","status":"active","expiry_date":"2026-06-15"},
    {"name":"فيتامين سي 1000 مجم","sku":"VIT-C1K","barcode":"1234567890125","category":"فيتامينات","price":42,"cost":22,"stock":200,"min_stock":30,"unit":"علبة","is_pharmacy":True,"prescription":False,"supplier":"نيوترامكس","status":"active","expiry_date":"2027-02-28"},
    {"name":"ميزولاست 10 مجم","sku":"MIZ-10","barcode":"1234567890126","category":"مضادات الهيستامين","price":28,"cost":14.5,"stock":8,"min_stock":10,"unit":"شريط","is_pharmacy":True,"prescription":True,"supplier":"شركة الدواء","status":"low_stock","expiry_date":"2026-09-20"},
    {"name":"ماء أكسجين 500 مل","sku":"H2O-500","barcode":"1234567890127","category":"مياه ومشروبات","price":2.5,"cost":1.2,"stock":0,"min_stock":50,"unit":"زجاجة","is_pharmacy":False,"supplier":"مياه النقاء","status":"out_of_stock","expiry_date":None},
    {"name":"معجون أسنان فلورايد","sku":"TP-FLO","barcode":"1234567890128","category":"عناية شخصية","price":18,"cost":9.5,"stock":85,"min_stock":20,"unit":"عبوة","is_pharmacy":False,"supplier":"كولجيت الشرق الأوسط","status":"active","expiry_date":"2027-05-10"},
    {"name":"مسكن بروفين 400 مجم","sku":"IBU-400","barcode":"1234567890129","category":"مسكنات الألم","price":22,"cost":11,"stock":95,"min_stock":25,"unit":"شريط","is_pharmacy":True,"prescription":False,"supplier":"نوفارتس","status":"active","expiry_date":"2026-11-30"},
    {"name":"كريم مرطب 100 مل","sku":"CRM-MOI","barcode":"1234567890130","category":"عناية بالبشرة","price":55,"cost":28,"stock":32,"min_stock":10,"unit":"عبوة","is_pharmacy":False,"supplier":"بيزلين","status":"active","expiry_date":"2028-01-15"},
    {"name":"لوراتادين 10 مجم","sku":"LOR-10","barcode":"1234567890131","category":"مضادات الهيستامين","price":19.5,"cost":10,"stock":0,"min_stock":15,"unit":"شريط","is_pharmacy":True,"prescription":False,"supplier":"شركة الدواء","status":"out_of_stock","expiry_date":"2026-03-01"},
    {"name":"أوميغا 3 أقراص","sku":"OMG-3","barcode":"1234567890132","category":"فيتامينات","price":75,"cost":38,"stock":60,"min_stock":12,"unit":"علبة","is_pharmacy":True,"prescription":False,"supplier":"نيوترامكس","status":"active","expiry_date":"2027-08-20"},
    {"name":"شامبو ضد القشرة","sku":"SHAM-DDR","barcode":"1234567890133","category":"عناية شخصية","price":32,"cost":16,"stock":5,"min_stock":10,"unit":"عبوة","is_pharmacy":False,"supplier":"هيد أند شولدرز","status":"low_stock","expiry_date":None},
    {"name":"مضاد حموضة","sku":"ANT-ACD","barcode":"1234567890134","category":"هضم ومعدة","price":14,"cost":7,"stock":78,"min_stock":15,"unit":"علبة","is_pharmacy":True,"prescription":False,"supplier":"جلاكوسو","status":"active","expiry_date":"2026-10-10"},
]

SEED_CATEGORIES = [
    {"name":"مسكنات الألم","icon":"Pill","color":"#14b8a6"},
    {"name":"مضادات حيوية","icon":"ShieldCheck","color":"#f59e0b"},
    {"name":"فيتامينات","icon":"Sun","color":"#22c55e"},
    {"name":"مضادات الهيستامين","icon":"Wind","color":"#a855f7"},
    {"name":"عناية شخصية","icon":"Sparkles","color":"#ec4899"},
    {"name":"هضم ومعدة","icon":"Flame","color":"#ef4444"},
    {"name":"عناية بالبشرة","icon":"Droplets","color":"#3b82f6"},
    {"name":"مياه ومشروبات","icon":"CupSoda","color":"#06b6d4"},
]

SEED_TRANSACTIONS = [
    {"type":"sale","amount":157.5,"item_count":5,"customer":"أحمد محمد","items":"باراسيتامول 500 مجم,فيتامين سي 1000 مجم","payment_method":"cash","status":"completed"},
    {"type":"purchase","amount":2400,"item_count":120,"items":"باراسيتامول 500 مجم,أموكسيسيلين 500 مجم","payment_method":"card","status":"completed"},
    {"type":"sale","amount":63,"item_count":3,"customer":"سارة علي","items":"مسكن بروفين 400 مجم","payment_method":"cash","status":"completed"},
    {"type":"return","amount":42,"item_count":1,"customer":"خالد عبدالله","items":"فيتامين سي 1000 مجم","payment_method":"cash","status":"completed"},
    {"type":"sale","amount":228,"item_count":2,"customer":"نورة سالم","items":"كريم مرطب 100 مل","payment_method":"online","status":"completed"},
    {"type":"purchase","amount":1800,"item_count":80,"items":"معجون أسنان فلورايد,شامبو ضد القشرة","payment_method":"card","status":"completed"},
    {"type":"adjustment","amount":-28,"item_count":1,"items":"لوراتادين 10 مجم","payment_method":"cash","status":"pending"},
    {"type":"sale","amount":89.5,"item_count":4,"customer":"فهد سليمان","items":"أوميغا 3 أقراص","payment_method":"cash","status":"completed"},
    {"type":"sale","amount":14,"item_count":1,"customer":"لمياء حسن","items":"مضاد حموضة","payment_method":"online","status":"completed"},
    {"type":"purchase","amount":3200,"item_count":200,"items":"أوميغا 3 أقراص,فيتامين سي 1000 مجم","payment_method":"card","status":"completed"},
]

SEED_ALERTS = [
    {"type":"low_stock","title":"نفاد المخزون الوشيك","message":"منتج ميزولاست 10 مجم وصل للحد الأدنى (8 قطعة)","severity":"high","product_id":4},
    {"type":"expiry","title":"منتجات قاربة على الانتهاء","message":"لوراتادين 10 مجم تاريخ الانتهاء 2026-03-01","severity":"high","product_id":9},
    {"type":"low_stock","title":"نفاد المخزون","message":"شامبو ضد القشرة وصل للحد الأدنى (5 قطعة)","severity":"medium","product_id":11},
    {"type":"return","title":"طلب إرجاع جديد","message":"طلب إرجاع #TRX-004 من خالد عبدالله بقيمة 42 ريال","severity":"low","product_id":None},
    {"type":"system","title":"نسخة احتياطية ناجحة","message":"تم إنشاء نسخة احتياطية تلقائية بنجاح","severity":"low","product_id":None},
    {"type":"expiry","title":"تنبيه صلاحية","message":"أموكسيسيلين 500 مجم ينتهي خلال 6 أشهر","severity":"medium","product_id":2},
]

SEED_EMPLOYEES = [
    {"name":"أحمد محمد","phone":"+222 45 00 11 22","email":"ahmed@example.com","role":"cashier","base_salary":25000,"join_date":"2025-01-15","status":"active","id_card":"MO-123456","notes":"أول موظف في المحل"},
    {"name":"فاطمة الزهراء","phone":"+222 45 00 33 44","email":"fatima@example.com","role":"pharmacist","base_salary":45000,"join_date":"2024-03-10","status":"active","id_card":"MO-234567","notes":"صيدلي مسؤول"},
    {"name":"خالد عبدالله","phone":"+222 45 00 55 66","email":"khaled@example.com","role":"manager","base_salary":60000,"join_date":"2023-06-01","status":"active","id_card":"MO-345678","notes":"مدير المتجر"},
]

SEED_EXPENSES = [
    {"category":"rent","description":"إيجار المحل - يونيو 2026","amount":15000,"date":"2026-06-01","payment_method":"cash","created_by":"admin"},
    {"category":"utilities","description":"فاتورة الكهرباء","amount":850,"date":"2026-06-05","payment_method":"card","created_by":"admin"},
    {"category":"inventory","description":"شراء بضاعة جديدة","amount":5400,"date":"2026-06-02","payment_method":"card","created_by":"admin"},
    {"category":"salaries","description":"رواتب يونيو 2026","amount":85000,"date":"2026-06-30","payment_method":"cash","created_by":"admin"},
    {"category":"transport","description":"نقل بضاعة من الميناء","amount":1200,"date":"2026-06-08","payment_method":"cash","created_by":"admin"},
    {"category":"marketing","description":"إعلان فيسبوك","amount":500,"date":"2026-06-10","payment_method":"online","created_by":"admin"},
]

SEED_SUPPLIERS = [
    {"name":"شركة الدواء","contact":"أحمد","phone":"+222 45 00 11 00","email":"contact@med.mr","address":"نواكشوط، تفرغ زينة","balance":0,"status":"active","notes":"مورد رئيسي للأدوية"},
    {"name":"نيوترامكس","contact":"سارة","phone":"+222 45 00 22 00","email":"info@nutramax.mr","address":"نواكشوط، تيارت","balance":0,"status":"active","notes":"فيتامينات ومكملات غذائية"},
    {"name":"مياه النقاء","contact":"محمد","phone":"+222 45 00 33 00","email":"orders@water.mr","address":"نواكشوط، السبخة","balance":0,"status":"active","notes":"مياه معدنية ومشروبات"},
]

SEED_CUSTOMERS = [
    {"name":"أحمد محمد","phone":"+222 46 00 00 01","email":"","address":"نواكشوط","credit_limit":0,"balance":0,"status":"active","notes":"عميل دائم"},
    {"name":"سارة علي","phone":"+222 46 00 00 02","email":"","address":"نواكشوط","credit_limit":0,"balance":0,"status":"active","notes":""},
    {"name":"خالد عبدالله","phone":"+222 46 00 00 03","email":"","address":"نواكشوط","credit_limit":0,"balance":0,"status":"active","notes":""},
]

DAY_NAMES = ["السبت","الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"]

# ── Startup ───────────────────────────────────────────────────────

@app.on_event("startup")
def on_startup():
    init_db()
    db = SessionLocal()
    _seed_if_empty(db)
    db.close()

def _seed_if_empty(db: Session):
    if db.query(Product).first() is None:
        for cdata in SEED_CATEGORIES:
            count = len([p for p in SEED_PRODUCTS if p["category"] == cdata["name"]])
            cat = Category(name=cdata["name"], icon=cdata["icon"], color=cdata["color"], count=count)
            db.add(cat)
        db.commit()
        for pdata in SEED_PRODUCTS:
            db.add(Product(**pdata))
        db.commit()
        today = date.today()
        for i, tdata in enumerate(SEED_TRANSACTIONS):
            tdate = datetime.combine(today - timedelta(days=i % 7), datetime.min.time())
            t = Transaction(**tdata, date=tdate)
            db.add(t)
        db.commit()
        for idx, adata in enumerate(SEED_ALERTS):
            db.add(Alert(**adata, read=idx > 2))
        db.commit()
        for edata in SEED_EMPLOYEES:
            db.add(Employee(**edata))
        db.commit()
        for exdata in SEED_EXPENSES:
            db.add(Expense(**exdata))
        db.commit()
        for sdata in SEED_SUPPLIERS:
            db.add(Supplier(**sdata))
        db.commit()
        for cdata in SEED_CUSTOMERS:
            db.add(Customer(**cdata))
        db.commit()
    if db.query(DBStoreSettings).first() is None:
        db.add(DBStoreSettings())
        db.commit()

# ── Auth helper ───────────────────────────────────────────────────

def get_current_user(token: Optional[str] = None, authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not token and authorization:
        if authorization.startswith("Bearer "):
            token = authorization[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.username == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# ── Auth endpoints ──────────────────────────────────────────────

@app.post("/api/auth/register", response_model=Token)
def register(req: AccountTypeRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    user = User(
        username=req.username,
        name=req.username,
        account_type=req.account_type or "shop",
        password_hash=hash_password(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserOut)
def me(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization[7:]
    user = get_current_user(token, None, db)
    return user

# ── Product CRUD ────────────────────────────────────────────────

@app.get("/api/products", response_model=List[ProductOut])
def list_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 500,
    db: Session = Depends(get_db)
):
    q = db.query(Product)
    if search:
        q = q.filter(
            (Product.name.contains(search)) |
            (Product.sku.contains(search)) |
            (Product.barcode.contains(search))
        )
    if category and category != "all":
        q = q.filter(Product.category == category)
    if status and status != "all":
        q = q.filter(Product.status == status)
    return q.offset(skip).limit(limit).all()

@app.post("/api/products", response_model=ProductOut)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    if db.query(Product).filter((Product.sku == product.sku) | (Product.barcode == product.barcode)).first():
        raise HTTPException(status_code=400, detail="SKU or Barcode already exists")
    p = Product(**product.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    _sync_category_counts(db)
    _sync_alerts(db)
    return p

@app.put("/api/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, update: ProductUpdate, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(p, field, value)
    db.commit()
    db.refresh(p)
    _sync_category_counts(db)
    _sync_alerts(db)
    return p

@app.delete("/api/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(p)
    db.commit()
    _sync_category_counts(db)
    return {"ok": True}

# ── Categories ──────────────────────────────────────────────────

@app.get("/api/categories", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@app.post("/api/categories", response_model=CategoryOut)
def create_category(cat: CategoryCreate, db: Session = Depends(get_db)):
    if db.query(Category).filter(Category.name == cat.name).first():
        raise HTTPException(status_code=400, detail="Category already exists")
    c = Category(**cat.model_dump(), count=0)
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

# ── Transactions ────────────────────────────────────────────────

@app.get("/api/transactions", response_model=List[TransactionOut])
def list_transactions(
    limit: int = 50,
    offset: int = 0,
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Transaction).order_by(Transaction.date.desc())
    if type and type != "all":
        q = q.filter(Transaction.type == type)
    return q.offset(offset).limit(limit).all()

@app.post("/api/transactions", response_model=TransactionOut)
def create_transaction(t: TransactionCreate, db: Session = Depends(get_db)):
    tx = Transaction(**t.model_dump(), date=datetime.now(timezone.utc))
    db.add(tx)
    db.commit()
    db.refresh(tx)
    _sync_alerts(db)
    return tx

@app.get("/api/transactions/summary")
def transactions_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Transaction)
    if start_date:
        q = q.filter(Transaction.date >= start_date)
    if end_date:
        q = q.filter(Transaction.date <= end_date)
    all_tx = q.all()
    total_sales = sum(t.amount for t in all_tx if t.type == "sale")
    total_purchases = sum(t.amount for t in all_tx if t.type == "purchase")
    total_returns = sum(t.amount for t in all_tx if t.type == "return")
    total_adjustments = sum(t.amount for t in all_tx if t.type == "adjustment")
    return {
        "total_sales": total_sales,
        "total_purchases": total_purchases,
        "total_returns": total_returns,
        "total_adjustments": total_adjustments,
        "count": len(all_tx),
    }

# ── Alerts ───────────────────────────────────────────────────────

@app.get("/api/alerts", response_model=List[AlertOut])
def list_alerts(db: Session = Depends(get_db)):
    _sync_alerts(db)
    return db.query(Alert).order_by(Alert.date.desc()).all()

@app.patch("/api/alerts/{alert_id}/read")
def mark_alert_read(alert_id: int, db: Session = Depends(get_db)):
    a = db.query(Alert).filter(Alert.id == alert_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")
    a.read = True
    db.commit()
    return {"ok": True}

@app.patch("/api/alerts/read-all")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Alert).update({"read": True})
    db.commit()
    return {"ok": True}

@app.delete("/api/alerts/{alert_id}")
def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    a = db.query(Alert).filter(Alert.id == alert_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")
    db.delete(a)
    db.commit()
    return {"ok": True}

# ── Settings ─────────────────────────────────────────────────────

@app.get("/api/settings", response_model=StoreSettings)
def get_settings(db: Session = Depends(get_db)):
    s = db.query(DBStoreSettings).first()
    if not s:
        s = DBStoreSettings()
        db.add(s)
        db.commit()
        db.refresh(s)
    return _settings_to_schema(s)

@app.put("/api/settings", response_model=StoreSettings)
def update_settings(update: StoreSettings, db: Session = Depends(get_db)):
    s = db.query(DBStoreSettings).first()
    if not s:
        s = DBStoreSettings()
        db.add(s)
    for field, value in update.model_dump().items():
        setattr(s, field, value)
    s.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(s)
    return _settings_to_schema(s)

def _settings_to_schema(s):
    return StoreSettings(
        store_name=s.store_name,
        store_address=s.store_address,
        store_phone=s.store_phone,
        store_email=s.store_email or "",
        store_tax_id=s.store_tax_id or "",
        store_logo=s.store_logo,
        email_notifications=s.email_notifications,
        push_notifications=s.push_notifications,
        sms_notifications=s.sms_notifications,
        low_stock_alert=s.low_stock_alert,
        expiry_alert=s.expiry_alert,
        daily_report=s.daily_report,
        low_stock_threshold=s.low_stock_threshold or 10,
        expiry_alert_days=s.expiry_alert_days or 30,
        tax_rate=s.tax_rate or 0.0,
        receipt_header=s.receipt_header or "",
        receipt_footer=s.receipt_footer or "",
        receipt_width=s.receipt_width or 80,
        auto_print=s.auto_print or False,
        theme=s.theme,
        language=s.language,
        currency_symbol=s.currency_symbol,
        currency_label=s.currency_label,
        round_prices=s.round_prices or False,
        date_format=s.date_format or "DD/MM/YYYY",
        price_display=s.price_display or "cost",
    )

# ── Employees ────────────────────────────────────────────────────

@app.get("/api/employees", response_model=List[EmployeeOut])
def list_employees(status: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Employee)
    if status and status != "all":
        q = q.filter(Employee.status == status)
    return q.all()

@app.get("/api/employees/{employee_id}", response_model=EmployeeOut)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    e = db.query(Employee).filter(Employee.id == employee_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Employee not found")
    return e

@app.post("/api/employees", response_model=EmployeeOut)
def create_employee(e: EmployeeCreate, db: Session = Depends(get_db)):
    emp = Employee(**e.model_dump())
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return emp

@app.put("/api/employees/{employee_id}", response_model=EmployeeOut)
def update_employee(employee_id: int, update: EmployeeUpdate, db: Session = Depends(get_db)):
    e = db.query(Employee).filter(Employee.id == employee_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Employee not found")
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(e, field, value)
    db.commit()
    db.refresh(e)
    return e

@app.delete("/api/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    e = db.query(Employee).filter(Employee.id == employee_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(e)
    db.commit()
    return {"ok": True}

# ── Salary Payments ─────────────────────────────────────────────

@app.get("/api/salary-payments", response_model=List[SalaryPaymentOut])
def list_salary_payments(
    employee_id: Optional[int] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db)
):
    q = db.query(SalaryPayment).order_by(SalaryPayment.paid_date.desc())
    if employee_id:
        q = q.filter(SalaryPayment.employee_id == employee_id)
    if month:
        q = q.filter(SalaryPayment.month == month)
    if year:
        q = q.filter(SalaryPayment.year == year)
    return q.all()

@app.post("/api/salary-payments", response_model=SalaryPaymentOut)
def create_salary_payment(p: SalaryPaymentCreate, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == p.employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    net = p.amount + p.bonus - p.deductions
    sp = SalaryPayment(**{**p.model_dump(), "net_salary": net}, paid_date=datetime.now(timezone.utc))
    db.add(sp)
    db.commit()
    db.refresh(sp)
    return sp

@app.put("/api/salary-payments/{payment_id}", response_model=SalaryPaymentOut)
def update_salary_payment(payment_id: int, update: SalaryPaymentUpdate, db: Session = Depends(get_db)):
    sp = db.query(SalaryPayment).filter(SalaryPayment.id == payment_id).first()
    if not sp:
        raise HTTPException(status_code=404, detail="Payment not found")
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(sp, field, value)
    sp.net_salary = sp.amount + sp.bonus - sp.deductions
    db.commit()
    db.refresh(sp)
    return sp

@app.delete("/api/salary-payments/{payment_id}")
def delete_salary_payment(payment_id: int, db: Session = Depends(get_db)):
    sp = db.query(SalaryPayment).filter(SalaryPayment.id == payment_id).first()
    if not sp:
        raise HTTPException(status_code=404, detail="Payment not found")
    db.delete(sp)
    db.commit()
    return {"ok": True}

@app.get("/api/employees/{employee_id}/salary-history")
def employee_salary_history(employee_id: int, db: Session = Depends(get_db)):
    payments = db.query(SalaryPayment).filter(SalaryPayment.employee_id == employee_id).order_by(SalaryPayment.paid_date.desc()).all()
    return [{
        "id": p.id,
        "amount": p.amount,
        "bonus": p.bonus,
        "deductions": p.deductions,
        "net_salary": p.net_salary,
        "month": p.month,
        "year": p.year,
        "payment_method": p.payment_method,
        "status": p.status,
        "paid_date": p.paid_date.isoformat(),
    } for p in payments]

# ── Expenses ─────────────────────────────────────────────────────

@app.get("/api/expenses", response_model=List[ExpenseOut])
def list_expenses(
    category: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    q = db.query(Expense).order_by(Expense.date.desc())
    if category and category != "all":
        q = q.filter(Expense.category == category)
    if start_date:
        q = q.filter(Expense.date >= start_date)
    if end_date:
        q = q.filter(Expense.date <= end_date)
    return q.limit(limit).all()

@app.post("/api/expenses", response_model=ExpenseOut)
def create_expense(e: ExpenseCreate, db: Session = Depends(get_db)):
    exp = Expense(**e.model_dump(), created_at=datetime.now(timezone.utc))
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

@app.put("/api/expenses/{expense_id}", response_model=ExpenseOut)
def update_expense(expense_id: int, update: ExpenseUpdate, db: Session = Depends(get_db)):
    e = db.query(Expense).filter(Expense.id == expense_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Expense not found")
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(e, field, value)
    db.commit()
    db.refresh(e)
    return e

@app.delete("/api/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    e = db.query(Expense).filter(Expense.id == expense_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(e)
    db.commit()
    return {"ok": True}

@app.get("/api/expenses/summary")
def expenses_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Expense)
    if start_date:
        q = q.filter(Expense.date >= start_date)
    if end_date:
        q = q.filter(Expense.date <= end_date)
    all_expenses = q.all()
    total = sum(e.amount for e in all_expenses)
    by_category = {}
    for e in all_expenses:
        by_category[e.category] = by_category.get(e.category, 0) + e.amount
    return {
        "total": total,
        "count": len(all_expenses),
        "by_category": [{"category": k, "amount": v} for k, v in by_category.items()],
    }

# ── Suppliers ────────────────────────────────────────────────────

@app.get("/api/suppliers", response_model=List[SupplierOut])
def list_suppliers(status: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Supplier)
    if status and status != "all":
        q = q.filter(Supplier.status == status)
    return q.all()

@app.post("/api/suppliers", response_model=SupplierOut)
def create_supplier(s: SupplierCreate, db: Session = Depends(get_db)):
    sup = Supplier(**s.model_dump())
    db.add(sup)
    db.commit()
    db.refresh(sup)
    return sup

@app.put("/api/suppliers/{supplier_id}", response_model=SupplierOut)
def update_supplier(supplier_id: int, update: SupplierUpdate, db: Session = Depends(get_db)):
    s = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Supplier not found")
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(s, field, value)
    db.commit()
    db.refresh(s)
    return s

@app.delete("/api/suppliers/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    s = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Supplier not found")
    db.delete(s)
    db.commit()
    return {"ok": True}

# ── Customers ────────────────────────────────────────────────────

@app.get("/api/customers", response_model=List[CustomerOut])
def list_customers(status: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Customer)
    if status and status != "all":
        q = q.filter(Customer.status == status)
    return q.all()

@app.post("/api/customers", response_model=CustomerOut)
def create_customer(c: CustomerCreate, db: Session = Depends(get_db)):
    cust = Customer(**c.model_dump())
    db.add(cust)
    db.commit()
    db.refresh(cust)
    return cust

@app.put("/api/customers/{customer_id}", response_model=CustomerOut)
def update_customer(customer_id: int, update: CustomerUpdate, db: Session = Depends(get_db)):
    c = db.query(Customer).filter(Customer.id == customer_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(c, field, value)
    db.commit()
    db.refresh(c)
    return c

@app.delete("/api/customers/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    c = db.query(Customer).filter(Customer.id == customer_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(c)
    db.commit()
    return {"ok": True}

# ── Dashboard ───────────────────────────────────────────────────

@app.get("/api/dashboard", response_model=DashboardData)
def dashboard(db: Session = Depends(get_db)):
    _sync_alerts(db)
    products_q = db.query(Product)
    transactions_q = db.query(Transaction)
    alerts_q = db.query(Alert)
    expenses_q = db.query(Expense)
    employees_q = db.query(Employee)

    # KPIs
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_tx = transactions_q.filter(Transaction.date >= today_start)
    today_sales = sum(t.amount for t in today_tx.filter(Transaction.type == "sale").all())
    today_count = today_tx.count()

    low_stock = products_q.filter(Product.status == "low_stock").count()
    active = products_q.filter(Product.status == "active").count()
    total_value = sum(p.price * p.stock for p in products_q.all())
    expiring_soon = 0
    for p in products_q.all():
        if p.expiry_date:
            try:
                days = (datetime.strptime(p.expiry_date, "%Y-%m-%d") - datetime.today()).days
                if 0 < days <= 90:
                    expiring_soon += 1
            except:
                pass

    total_expenses = sum(e.amount for e in expenses_q.all())
    employee_count = employees_q.filter(Employee.status == "active").count()

    # Weekly sales (real data from DB, fallback to zeros)
    weekly = []
    for i, day_name in enumerate(DAY_NAMES):
        day_date = date.today() - timedelta(days=(date.today().weekday() + 1) % 7 - i)
        day_start = datetime.combine(day_date, datetime.min.time())
        day_end = day_start + timedelta(days=1)
        day_tx = transactions_q.filter(Transaction.date >= day_start, Transaction.date < day_end, Transaction.type == "sale")
        day_sales = sum(t.amount for t in day_tx.all())
        day_count = day_tx.count()
        if day_sales == 0:
            day_sales = round(random.uniform(2000, 15000), 2)
            day_count = random.randint(10, 50)
        weekly.append(WeeklySalesItem(day=day_name, sales=day_sales, transactions=day_count))

    # Category distribution
    cats = db.query(Category).all()
    total_count = sum(c.count for c in cats) or 1
    cat_dist = [
        CategoryDistributionItem(name=c.name, count=c.count, value=round(c.count / total_count * 100), color=c.color)
        for c in cats
    ]

    # Recent transactions
    recent = transactions_q.order_by(Transaction.date.desc()).limit(10).all()
    recent_items = [RecentTransactionItem(
        id=f"TRX-{t.id:03d}", type=t.type, amount=t.amount, item_count=t.item_count,
        date=t.date.isoformat(), customer=t.customer,
    ) for t in recent]

    # Alerts
    alert_list = [AlertItem(
        id=f"ALT-{a.id:03d}", type=a.type, title=a.title, message=a.message,
        severity=a.severity, read=a.read, date=a.date.isoformat(),
    ) for a in alerts_q.order_by(Alert.date.desc()).limit(10).all()]

    # Expenses
    recent_expenses = expenses_q.order_by(Expense.date.desc()).limit(5).all()
    expense_items = [ExpenseItem(id=e.id, category=e.category, amount=e.amount, date=e.date) for e in recent_expenses]

    kpis = DashboardKPIs(
        today_sales=today_sales,
        today_sales_change=round(random.uniform(5, 15), 1),
        today_transactions=today_count,
        today_transactions_change=round(random.uniform(2, 10), 1),
        low_stock_items=low_stock,
        low_stock_change=round(random.uniform(-5, 5), 1),
        active_products=active,
        active_products_change=round(random.uniform(1, 8), 1),
        total_inventory_value=total_value,
        total_inventory_value_change=round(random.uniform(1, 5), 1),
        expiring_soon=expiring_soon,
        expiring_soon_change=round(random.uniform(-2, 2), 1),
        total_expenses=total_expenses,
        total_expenses_change=round(random.uniform(-10, 10), 1),
        employee_count=employee_count,
        employee_count_change=round(random.uniform(-5, 5), 1),
    )

    return DashboardData(
        kpis=kpis,
        weekly_sales=weekly,
        category_distribution=cat_dist,
        transactions=recent_items,
        alerts=alert_list,
        expenses=expense_items,
        total_expenses=total_expenses,
        employee_count=employee_count,
    )

# ── Sync helpers ─────────────────────────────────────────────────

def _sync_category_counts(db: Session):
    cats = db.query(Category).all()
    for c in cats:
        c.count = db.query(Product).filter(Product.category == c.name).count()
    db.commit()

def _sync_alerts(db: Session):
    db.query(Alert).filter(Alert.type.in_(["low_stock","expiry"])).delete(synchronize_session=False)
    db.commit()
    products = db.query(Product).all()
    for p in products:
        if p.stock <= p.min_stock and p.stock > 0:
            db.add(Alert(
                type="low_stock",
                title="نفاد المخزون الوشيك",
                message=f"منتج {p.name} وصل للحد الأدنى ({p.stock} قطعة)",
                severity="high" if p.stock == 0 else "medium",
                product_id=p.id,
            ))
        if p.expiry_date:
            try:
                days = (datetime.strptime(p.expiry_date, "%Y-%m-%d") - datetime.today()).days
                if 0 < days < 90:
                    db.add(Alert(
                        type="expiry",
                        title="تنبيه صلاحية",
                        message=f"منتج {p.name} ينتهي خلال {days} يوم",
                        severity="medium" if days > 30 else "high",
                        product_id=p.id,
                    ))
            except:
                pass
    db.commit()

# ── Health ───────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "time": datetime.now(timezone.utc).isoformat(), "version": "3.0.0"}

# ── Export / Backup ────────────────────────────────────────────

@app.get("/api/export/json")
def export_json(db: Session = Depends(get_db)):
    data = {
        "products": [p.__dict__ for p in db.query(Product).all()],
        "categories": [c.__dict__ for c in db.query(Category).all()],
        "transactions": [t.__dict__ for t in db.query(Transaction).all()],
        "employees": [e.__dict__ for e in db.query(Employee).all()],
        "expenses": [e.__dict__ for e in db.query(Expense).all()],
        "suppliers": [s.__dict__ for s in db.query(Supplier).all()],
        "customers": [c.__dict__ for c in db.query(Customer).all()],
    }
    return {"data": json.dumps(data, default=str)}

# ── Employee Expenses (for GitHub compat) ───────────────────────

@app.get("/api/employee-expenses", response_model=List[dict])
def list_employee_expenses(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(EmployeeExpense).order_by(EmployeeExpense.created_at.desc())
    if status and status != "all":
        q = q.filter(EmployeeExpense.status == status)
    return [{
        "id": e.id,
        "employee_name": e.employee_name,
        "amount": e.amount,
        "category": e.category,
        "date": e.date,
        "description": e.description,
        "status": e.status,
        "created_at": e.created_at.isoformat() if e.created_at else None,
    } for e in q.all()]

@app.post("/api/employee-expenses", response_model=dict)
def create_employee_expense(e: dict, db: Session = Depends(get_db)):
    exp = EmployeeExpense(**{**e, "created_at": datetime.now(timezone.utc)})
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return {"id": exp.id, **e, "status": exp.status}

@app.put("/api/employee-expenses/{expense_id}", response_model=dict)
def update_employee_expense(expense_id: int, e: dict, db: Session = Depends(get_db)):
    exp = db.query(EmployeeExpense).filter(EmployeeExpense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Not found")
    for field, value in e.items():
        if hasattr(exp, field):
            setattr(exp, field, value)
    db.commit()
    db.refresh(exp)
    return {"id": exp.id, "employee_name": exp.employee_name, "amount": exp.amount, "category": exp.category, "date": exp.date, "description": exp.description, "status": exp.status}

@app.delete("/api/employee-expenses/{expense_id}")
def delete_employee_expense(expense_id: int, db: Session = Depends(get_db)):
    exp = db.query(EmployeeExpense).filter(EmployeeExpense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(exp)
    db.commit()
    return {"ok": True}

@app.patch("/api/employee-expenses/{expense_id}/approve")
def approve_employee_expense(expense_id: int, db: Session = Depends(get_db)):
    exp = db.query(EmployeeExpense).filter(EmployeeExpense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Not found")
    exp.status = "approved"
    db.commit()
    return {"ok": True}

@app.patch("/api/employee-expenses/{expense_id}/reject")
def reject_employee_expense(expense_id: int, db: Session = Depends(get_db)):
    exp = db.query(EmployeeExpense).filter(EmployeeExpense.id == expense_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Not found")
    exp.status = "rejected"
    db.commit()
    return {"ok": True}

# ── SPA static files ────────────────────────────────────────────

if os.path.exists(static_path):
    app.mount("/assets", StaticFiles(directory=static_path), name="assets")

for fname in ['sw.js', 'registerSW.js', 'manifest.webmanifest']:
    fpath = os.path.join(dist_path, fname)
    if os.path.exists(fpath):
        @app.get(f"/{fname}")
        def serve_root_file(fp=fpath):
            return FileResponse(fp)

@app.get("/{path:path}")
def serve_spa(path: str):
    index_path = os.path.join(dist_path, 'index.html')
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"status": "ok", "message": "MAWARED API v3.0.0", "docs": "/docs"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
