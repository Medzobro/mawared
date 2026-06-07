# <div align="center">🏬 مـورد | MAWARED</div>

<div align="center">

[![Version](https://img.shields.io/badge/version-2.0.0-teal.svg)](https://github.com/Medzobro/mawared)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-2496ED.svg)](docker-compose.yml)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-61DAFB.svg)](https://react.dev)

**نظام إدارة المخزونات والصيدليات الذكي | Smart Inventory & Pharmacy Management System**

[🇬🇧 English](#english) | [🇫🇷 Français](#français)

</div>

---

## 🇸🇦 العربية

### 🎯 نظرة عامة

**مورد** هو نظام متكامل لإدارة المخزونات والصيدليات مبني بأحدث التقنيات. يوفر واجهة عصرية، أداءً عالياً، وميزات احترافية تنافس أكبر الأنظمة العالمية.

### ✨ الميزات الرئيسية

- 📊 **لوحة تحكم تفاعلية** — رسوم بيانية ومؤشرات KPI في الوقت الفعلي
- 📦 **إدارة المنتجات** — مع باركود، QR، وتصنيف ذكي
- 💊 **الوضع الصيدلي** — إدارة أدوية، صلاحيات، ووصفات طبية
- 🔔 **تنبيهات ذكية** — مخزون منخفض، انتهاء صلاحية، تقارير يومية
- 🌍 **تعدد اللغات** — العربية، الإنجليزية، الفرنسية
- 🌙 **الوضع الداكن/الفاتح** — تلقائي أو يدوي
- 📱 **تصميم متجاوب** — يعمل على جميع الأجهزة
- 🔐 **أمان عالي** — JWT، Rate Limiting، CORS محمي
- 🐳 **Docker Ready** — تشغيل بنقرة واحدة

### 🛠️ التقنيات المستخدمة

| الطبقة | التقنية |
|--------|---------|
| Backend | Python 3.11, FastAPI, SQLAlchemy, SQLite |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Charts | Recharts |
| Animation | Framer Motion |
| State | Zustand |
| i18n | i18next |
| Auth | JWT (python-jose) |
| QR/Barcode | qrcode, jsbarcode, html5-qrcode |

### 🚀 التثبيت

#### الطريقة 1: Docker (موصى بها)

```bash
git clone https://github.com/Medzobro/mawared.git
cd mawared
cp .env.example .env
# عدل .env حسب الحاجة
docker-compose up -d
```

الواجهة: http://localhost:3000  
API: http://localhost:8080/api

#### الطريقة 2: محلي

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8080

# Frontend (في terminal آخر)
cd frontend
npm install
npm run dev
```

### ⚙️ متغيرات البيئة

| المتغير | الوصف | الافتراضي |
|---------|-------|-----------|
| `JWT_SECRET` | مفتاح JWT (مطلوب) | - |
| `DATABASE_URL` | مسار قاعدة البيانات | `sqlite:///backend/mawared.db` |
| `ENV` | بيئة التشغيل | `development` |
| `CORS_ORIGINS` | نطاقات CORS المسموحة | `http://localhost:3000` |

### 📡 وثائق API

بعد تشغيل الخادم، افتح:
- Swagger UI: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc

### 📸 لقطات الشاشة

*(سيتم إضافة لقطات الشاشة قريباً)*

### 🤝 المساهمة

نرحب بمساهماتكم! راجع [CONTRIBUTING.md](CONTRIBUTING.md)

### 📄 الترخيص

هذا المشروع مرخص بموجب [MIT License](LICENSE)

---

## 🇬🇧 English

### 🎯 Overview

**MAWARED** is a comprehensive inventory and pharmacy management system built with cutting-edge technologies. It provides a modern interface, high performance, and professional features that rival the biggest global systems.

### ✨ Key Features

- 📊 **Interactive Dashboard** — Charts and real-time KPIs
- 📦 **Product Management** — With barcode, QR, and smart categorization
- 💊 **Pharmacy Mode** — Medicine management, expiry tracking, prescriptions
- 🔔 **Smart Alerts** — Low stock, expiry, daily reports
- 🌍 **Multi-language** — Arabic, English, French
- 🌙 **Dark/Light Mode** — Automatic or manual
- 📱 **Responsive Design** — Works on all devices
- 🔐 **High Security** — JWT, Rate Limiting, Protected CORS
- 🐳 **Docker Ready** — One-click deployment

### 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.11, FastAPI, SQLAlchemy, SQLite |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Charts | Recharts |
| Animation | Framer Motion |
| State | Zustand |
| i18n | i18next |
| Auth | JWT (python-jose) |
| QR/Barcode | qrcode, jsbarcode, html5-qrcode |

### 🚀 Installation

#### Method 1: Docker (Recommended)

```bash
git clone https://github.com/Medzobro/mawared.git
cd mawared
cp .env.example .env
# Edit .env as needed
docker-compose up -d
```

Frontend: http://localhost:3000  
API: http://localhost:8080/api

#### Method 2: Local

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8080

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

### ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `JWT_SECRET` | JWT secret key (required) | - |
| `DATABASE_URL` | Database path | `sqlite:///backend/mawared.db` |
| `ENV` | Environment | `development` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |

### 📡 API Documentation

After starting the server:
- Swagger UI: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc

### 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md)

### 📄 License

This project is licensed under the [MIT License](LICENSE)

---

<div align="center">

**صُنع ب❤️ في موريتانيا | Made with ❤️ in Mauritania**

</div>
