# 🧶 CrochetLoom - Artisanal Crochet E-Commerce Platform

A production-ready, full-stack Crochet E-Commerce web platform handcrafted with **Next.js (App Router, TypeScript, Tailwind CSS, Zustand)** and **NestJS (TypeORM, PostgreSQL, JWT Auth)**.

Includes a dedicated **Postman Collection & Environment Suite** (replacing Swagger), **Tag Master Taxonomy** with multi-product tag filtering (e.g. flower, purse, amigurumi, cardigan), and **Customer Google Sign-In & Sign-Up**.

---

## 🏗️ Project Architecture

```text
Crochet/
├── backend/                  # NestJS REST API (PostgreSQL + TypeORM)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── admin-auth/   # Admin JWT authentication
│   │   │   ├── customer-auth/# Customer Email & Google OAuth login/register
│   │   │   ├── admins/       # Admin entity & service
│   │   │   ├── customers/    # Customer entity & profile
│   │   │   ├── categories/   # Category collections
│   │   │   ├── tags/         # 🏷️ Tag Master (flower, purse, etc.)
│   │   │   ├── products/     # Products with multi-tag filtering & search
│   │   │   ├── cart/         # Shopping cart & stock verification
│   │   │   ├── addresses/    # Saved delivery addresses
│   │   │   ├── orders/       # Order management & status pipeline
│   │   │   ├── payments/     # Razorpay order creation & signature verification
│   │   │   └── uploads/      # Image uploads (Cloudinary / Local disk fallback)
│   │   ├── database/seeds/   # Realistic database seeder
│   │   └── config/           # Database, JWT, Razorpay, Cloudinary config
│   ├── .env                  # Backend environment settings
│   └── package.json
│
├── frontend/                 # Next.js 14 App Router + Tailwind CSS + Zustand
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx      # Homepage (Hero, TagNav, Featured, Story)
│   │   │   ├── products/     # Catalog with Tag Master filtering
│   │   │   ├── products/[id] # Product details & image gallery
│   │   │   ├── cart/         # Shopping cart page
│   │   │   ├── checkout/     # Checkout with Razorpay payment
│   │   │   ├── orders/       # Customer orders & tracking timeline
│   │   │   ├── profile/      # Saved addresses & account settings
│   │   │   ├── login/        # Customer Sign-In (Email + Google)
│   │   │   ├── register/     # Customer Sign-Up (Email + Google)
│   │   │   └── admin/        # Admin portal & Dashboard (Products, Tags, Orders)
│   │   ├── components/       # Design system & Reusable UI components
│   │   ├── services/         # Axios API clients
│   │   ├── store/            # Zustand stores (Auth & Cart)
│   │   └── types/            # TypeScript interfaces
│   └── package.json
│
└── postman/                  # 🚀 Complete Postman Suite (Replacing Swagger)
    ├── crochet-api.postman_collection.json
    ├── crochet-api.postman_environment.json
    └── README.md
```

---

## ⚡ Quick Start Guide

### 1. Start the Backend API
```bash
cd backend
npm install
npm run start:dev
```
The NestJS API will start on: **`http://localhost:5000/api`**

To seed realistic crochet products, categories, Tag Master tags, and admin/customer accounts:
```bash
npm run seed
```

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
The Next.js storefront will open on: **`http://localhost:3000`**

---

## 🔑 Default Seeded Credentials

- **Admin Portal**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
  - Email: `admin@crochet.com`
  - Password: `Admin@123`

- **Demo Customer**: [http://localhost:3000/login](http://localhost:3000/login)
  - Email: `customer@crochet.com`
  - Password: `Customer@123`
  - *Or click "Continue with Google" for instant one-click onboarding!*

---

## 📬 Postman API Testing (Replacing Swagger)

1. Open **Postman**.
2. Click **Import** $\to$ select both files in `postman/`:
   - `postman/crochet-api.postman_collection.json`
   - `postman/crochet-api.postman_environment.json`
3. Set your active environment to **`Crochet API Local Environment`**.
4. Run `Admin Login` or `Customer Login` — the test scripts automatically set `{{admin_token}}` and `{{customer_token}}` for all subsequent requests!

---

## 🏷️ Tag Master Taxonomy Features
- **Many-to-Many Relationships**: Products can have multiple tags (e.g. `flower`, `purse`, `amigurumi`, `cardigan`, `keychain`, `blanket`, `coaster`).
- **Interactive Tag Navigation**: The customer storefront features a sticky Tag Navigation bar (`<TagNav />`) with emoji icons for instant single-click product filtering.
- **Admin Tag Master Management**: Admin portal allows full CRUD over tags in `/admin/dashboard/tags`.
