from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta, date
import random
import os
import csv
import io
import json

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from database import engine, SessionLocal, get_db, init_db
from database import User, Category, Product, Transaction, Alert, StoreSettings as DBStoreSettings, AuditLog
from schemas import (
    UserCreate, UserOut, LoginRequest, Token,
    ProductCreate, ProductUpdate, ProductOut, PaginatedProducts,
    TransactionCreate, TransactionOut,
    AlertCreate, AlertOut,
    CategoryCreate, CategoryOut,
    StoreSettings,
    DashboardData, DashboardKPIs, WeeklySalesItem, CategoryDistributionItem,
    RecentTransactionItem, AlertItem, AuditLogOut,
)
from auth import hash_password, verify_password, create_access_token, decode_access_token

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="MAWARED API", version="2.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS - read from env with safe defaults for development
raw_origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173")
origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
if os.environ.get("ENV") == "development" and not origins:
    origins = ["http://localhost:3000", "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
)

# ── Static files (SPA) ────────────────────────────────────────────────
dist_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')
static_path = os.path.join(dist_path, 'assets')

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

DAY_NAMES = ["السبت","الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"]

@app.on_event("startup")
def on_startup():
    init_db()
    db = SessionLocal()
    _seed_if_empty(db)
    db.close()

def _seed_if_empty(db: Session):
    if db.query(Product).first() is None:
        # Seed categories
        for cdata in SEED_CATEGORIES:
            count = len([p for p in SEED_PRODUCTS if p["category"] == cdata["name"]])
            cat = Category(name=cdata["name"], icon=cdata["icon"], color=cdata["color"], count=count)
            db.add(cat)
        db.commit()

        # Seed products
        for pdata in SEED_PRODUCTS:
            db.add(Product(**pdata))
        db.commit()

        # Seed transactions (dates spread over last week)
        today = date.today()
        for i, tdata in enumerate(SEED_TRANSACTIONS):
            tdate = datetime.combine(today - timedelta(days=i % 7), datetime.min.time())
            t = Transaction(**tdata, date=tdate)
            db.add(t)
        db.commit()

        # Seed alerts
        for idx, adata in enumerate(SEED_ALERTS):
            db.add(Alert(**adata, read=idx > 2))
        db.commit()

    # Ensure settings row exists
    if db.query(DBStoreSettings).first() is None:
        db.add(DBStoreSettings())
        db.commit()

# ── Helper GET current user ─────────────────────────────────────────────

def get_current_user(token: str, db: Session):
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.username == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def get_current_admin(token: str, db: Session):
    user = get_current_user(token, db)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def log_audit(db: Session, action: str, entity: str, entity_id: Optional[int], user_id: int, details: str = ""):
    """Log an audit entry."""
    entry = AuditLog(
        action=action,
        entity=entity,
        entity_id=entity_id,
        user_id=user_id,
        details=details,
    )
    db.add(entry)
    db.commit()

# ── Auth endpoints ─────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=Token)
def register(req: LoginRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")

    # Default password is same as username for dev convenience
    user = User(
        username=req.username,
        name=req.username,
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
def me(token: Optional[str] = None, db: Session = Depends(get_db)):
    if not token:
        raise HTTPException(status_code=401, detail="Missing token")
    user = get_current_user(token, db)
    return user

# ── Product CRUD ───────────────────────────────────────────────────────

@app.get("/api/products", response_model=PaginatedProducts)
def list_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 50,
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
    
    total = q.count()
    skip = (page - 1) * limit
    items = q.offset(skip).limit(limit).all()
    pages = (total + limit - 1) // limit
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "pages": pages,
        "limit": limit,
    }

@app.post("/api/products", response_model=ProductOut)
def create_product(product: ProductCreate, request: Request, db: Session = Depends(get_db)):
    if db.query(Product).filter((Product.sku == product.sku) | (Product.barcode == product.barcode)).first():
        raise HTTPException(status_code=400, detail="SKU or Barcode already exists")
    p = Product(**product.model_dump())
    db.add(p)
    db.commit()
    db.refresh(p)
    _sync_category_counts(db)
    _sync_alerts(db)
    log_audit(db, "create", "product", p.id, 0, f"Created product: {p.name}")
    return p

@app.put("/api/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, update: ProductUpdate, request: Request, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(p, field, value)
    db.commit()
    db.refresh(p)
    _sync_category_counts(db)
    _sync_alerts(db)
    log_audit(db, "update", "product", p.id, 0, f"Updated product: {p.name}")
    return p

@app.delete("/api/products/{product_id}")
def delete_product(product_id: int, request: Request, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    name = p.name
    db.delete(p)
    db.commit()
    _sync_category_counts(db)
    log_audit(db, "delete", "product", product_id, 0, f"Deleted product: {name}")
    return {"ok": True}

# Sync category counts

def _sync_category_counts(db: Session):
    cats = db.query(Category).all()
    for c in cats:
        c.count = db.query(Product).filter(Product.category == c.name).count()
    db.commit()

# Sync alerts (low stock / expiry)

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
            days = (datetime.strptime(p.expiry_date, "%Y-%m-%d") - datetime.today()).days
            if days < 90 and days > 0:
                db.add(Alert(
                    type="expiry",
                    title="تنبيه صلاحية",
                    message=f"منتج {p.name} ينتهي خلال {days} يوم",
                    severity="medium" if days > 30 else "high",
                    product_id=p.id,
                ))
    db.commit()

# ── Categories ─────────────────────────────────────────────────────────

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

# ── Transactions ───────────────────────────────────────────────────────

@app.get("/api/transactions", response_model=List[TransactionOut])
def list_transactions(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    return db.query(Transaction).order_by(Transaction.date.desc()).limit(limit).all()

@app.post("/api/transactions", response_model=TransactionOut)
def create_transaction(t: TransactionCreate, db: Session = Depends(get_db)):
    tx = Transaction(**t.model_dump(), date=datetime.utcnow())
    db.add(tx)
    db.commit()
    db.refresh(tx)
    _sync_alerts(db)
    return tx

# ── Alerts ─────────────────────────────────────────────────────────────

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

# ── Settings ──────────────────────────────────────────────────────────

@app.get("/api/settings", response_model=StoreSettings)
def get_settings(db: Session = Depends(get_db)):
    s = db.query(DBStoreSettings).first()
    if not s:
        s = DBStoreSettings()
        db.add(s)
        db.commit()
        db.refresh(s)
    return StoreSettings(
        store_name=s.store_name,
        store_address=s.store_address,
        store_phone=s.store_phone,
        email_notifications=s.email_notifications,
        push_notifications=s.push_notifications,
        sms_notifications=s.sms_notifications,
        low_stock_alert=s.low_stock_alert,
        expiry_alert=s.expiry_alert,
        daily_report=s.daily_report,
        theme=s.theme,
        language=s.language,
        currency_symbol=s.currency_symbol,
        currency_label=s.currency_label,
    )

@app.put("/api/settings", response_model=StoreSettings)
def update_settings(update: StoreSettings, db: Session = Depends(get_db)):
    s = db.query(DBStoreSettings).first()
    if not s:
        s = DBStoreSettings()
        db.add(s)
    for field, value in update.model_dump().items():
        setattr(s, field, value)
    s.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(s)
    return update

# ── Dashboard ─────────────────────────────────────────────────────────

@app.get("/api/dashboard", response_model=DashboardData)
def dashboard(db: Session = Depends(get_db)):
    _sync_alerts(db)
    products_q = db.query(Product)
    transactions_q = db.query(Transaction)
    alerts_q = db.query(Alert)

    # KPIs
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_tx = transactions_q.filter(Transaction.date >= today_start)
    today_sales = sum([t.amount for t in today_tx.filter(Transaction.type == "sale").all()])
    today_count = today_tx.count()

    low_stock = products_q.filter(Product.status == "low_stock").count()
    active = products_q.filter(Product.status == "active").count()
    total_value = sum([p.price * p.stock for p in products_q.all()])
    expiring_soon = 0
    for p in products_q.all():
        if p.expiry_date:
            days = (datetime.strptime(p.expiry_date, "%Y-%m-%d") - datetime.today()).days
            if 0 < days <= 90:
                expiring_soon += 1

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
    )

    # Weekly sales
    today_idx = date.today().weekday()
    weekly = []
    for i, day_name in enumerate(DAY_NAMES):
        day_sales = round(random.uniform(8000, 22000), 2)
        weekly.append(WeeklySalesItem(day=day_name, sales=day_sales, transactions=random.randint(30, 70)))

    # Category distribution
    cats = db.query(Category).all()
    total_count = sum(c.count for c in cats) or 1
    cat_dist = [
        CategoryDistributionItem(name=c.name, count=c.count,
                                   value=round(c.count / total_count * 100), color=c.color)
        for c in cats
    ]

    # Recent transactions
    recent = transactions_q.order_by(Transaction.date.desc()).limit(10).all()
    recent_items = []
    for t in recent:
        recent_items.append(RecentTransactionItem(
            id=f"TRX-{t.id:03d}",
            type=t.type,
            amount=t.amount,
            item_count=t.item_count,
            date=t.date.isoformat(),
            customer=t.customer,
        ))

    # Alerts
    alert_list = []
    for a in alerts_q.order_by(Alert.date.desc()).limit(10).all():
        alert_list.append(AlertItem(
            id=f"ALT-{a.id:03d}",
            type=a.type,
            title=a.title,
            message=a.message,
            severity=a.severity,
            read=a.read,
            date=a.date.isoformat(),
        ))

    return DashboardData(
        kpis=kpis,
        weekly_sales=weekly,
        category_distribution=cat_dist,
        transactions=recent_items,
        alerts=alert_list,
    )

# ── Import / Export ─────────────────────────────────────────────────────

@app.post("/api/products/import")
def import_products(file: bytes, request: Request, db: Session = Depends(get_db)):
    """Import products from CSV or JSON."""
    try:
        content = file.decode('utf-8').strip()
        if content.startswith('[') or content.startswith('{'):
            data = json.loads(content)
        else:
            reader = csv.DictReader(io.StringIO(content))
            data = list(reader)
        
        imported = 0
        for row in data:
            p = Product(**row)
            db.add(p)
            imported += 1
        db.commit()
        log_audit(db, "import", "product", None, 0, f"Imported {imported} products")
        return {"imported": imported}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Import failed: {str(e)}")

@app.get("/api/products/export")
def export_products(
    format: str = "json",
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Export products to CSV or JSON."""
    q = db.query(Product)
    if category and category != "all":
        q = q.filter(Product.category == category)
    products = q.all()
    
    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["id", "name", "sku", "barcode", "category", "price", "cost", "stock", "min_stock", "unit", "status", "supplier"])
        for p in products:
            writer.writerow([p.id, p.name, p.sku, p.barcode, p.category, p.price, p.cost, p.stock, p.min_stock, p.unit, p.status, p.supplier])
        return {"content": output.getvalue(), "filename": "products.csv", "type": "text/csv"}
    
    data = [{
        "id": p.id, "name": p.name, "sku": p.sku, "barcode": p.barcode,
        "category": p.category, "price": p.price, "cost": p.cost,
        "stock": p.stock, "min_stock": p.min_stock, "unit": p.unit,
        "status": p.status, "supplier": p.supplier,
    } for p in products]
    return {"content": json.dumps(data, ensure_ascii=False, indent=2), "filename": "products.json", "type": "application/json"}

# ── Audit Logs ─────────────────────────────────────────────────────────

@app.get("/api/audit-logs", response_model=List[AuditLogOut])
def list_audit_logs(
    limit: int = 100,
    offset: int = 0,
    action: Optional[str] = None,
    entity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(AuditLog)
    if action:
        q = q.filter(AuditLog.action == action)
    if entity:
        q = q.filter(AuditLog.entity == entity)
    return q.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()

# ── Health ──────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat(), "version": "2.0.0"}

# ── SPA static files ────────────────────────────────────────────────────

# Serve static assets
if os.path.exists(static_path):
    app.mount("/assets", StaticFiles(directory=static_path), name="assets")

# Serve root static files (sw.js, manifest, etc.)
for fname in ['sw.js', 'registerSW.js', 'manifest.webmanifest']:
    fpath = os.path.join(dist_path, fname)
    if os.path.exists(fpath):
        @app.get(f"/{fname}")
        def serve_root_file(fp=fpath):
            return FileResponse(fp)

# SPA fallback - serve index.html for all non-API routes
@app.get("/{path:path}")
def serve_spa(path: str):
    index_path = os.path.join(dist_path, 'index.html')
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"status": "ok", "message": "MAWARED API", "docs": "/docs"}

# ── Run ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
