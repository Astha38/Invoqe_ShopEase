# Invoqe_ShopEase — Full-Stack E-Commerce Web Application

A full-stack e-commerce web application built with **React**, **Node.js / Express**, and **PostgreSQL** for the **Invoqe Full-Stack Development Internship (Task 1)**. Users can browse curated products, filter by category or search query, save wishlist favorites, apply promo coupons, pay via UPI / Card / Cash on Delivery, track order progress, and manage inventory and orders through a role-protected Admin Dashboard.

---

## Features

### Core E-Commerce Features
- **Product Catalog & Details**: Responsive product grid with editorial hero spotlights, stock status indicators, and detailed product pages (`/product/:id`).
- **Search & Category Filtering**: Real-time search by product name and category pill filtering (`Electronics`, `Clothing`, `Books`, `Home`).
- **Shopping Cart**: Add items, increment/decrement quantities with stock validation, remove items, and calculate live totals.
- **User Authentication**: Secure registration and login with `bcryptjs` password hashing and JWT authentication (`/register`, `/login`).
- **Transactional Order Checkout**: PostgreSQL row-level locking (`FOR UPDATE`) during checkout to prevent overselling and automatically decrement product stock.
- **Responsive UI**: Desktop and mobile layouts with a collapsible mobile navigation drawer.

### Bonus Features Implemented
- **Admin Dashboard (`/admin`)**: Role-protected (`admin`) portal featuring revenue & order stats, low-stock inventory alerts, product CRUD (create, edit, deactivate), order status updates, user overview, and coupon management.
- **Wishlist / Favorites (`/favorites`)**: Save/remove favorite products with live navbar badge count and one-click share link support.
- **Promo Coupons**: Database-backed coupon validation (`WELCOME10` for 10% off, `FREESHIP` for free express shipping, `SAVE200` for ₹200 off orders ₹1499+).
- **Payment Integration (Demo Checkout)**: Supports **UPI**, **Credit/Debit Card**, and **Cash on Delivery (COD)** with payment status (`paid` / `pending`) and generated payment reference IDs.
- **Order Tracking (`/orders`)**: Visual 4-step order tracking stepper (`Order Placed` → `Payment Confirmed` → `Shipped` → `Delivered`), automatic tracking numbers on shipment, and itemized order summaries.

---

## Technologies Used

- **Frontend**: React 19, Vite 8, React Router DOM 7, Axios, Custom CSS Design System
- **Backend**: Node.js, Express 5, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv`
- **Database**: PostgreSQL (`pg` connection pool)
- **Dev Tooling**: `concurrently`, `nodemon`, `oxlint`

---

## Project Structure

```text
Invoqe_ShopEase/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Navbar (with mobile drawer), Hero, Footer
│   │   ├── pages/              # Products, ProductDetail, Cart, Orders, Favorites, AuthPage, Admin
│   │   ├── utils/              # Product share helper
│   │   ├── AuthContext.jsx     # JWT + user session state
│   │   ├── FavoritesContext.jsx# Wishlist state
│   │   └── api.js              # Axios instance with auth interceptor
│   └── vite.config.js          # Proxies /api requests to backend
├── server/                     # Express + PostgreSQL backend
│   ├── sql/
│   │   ├── schema.sql          # Database tables (users, categories, products, carts, coupons, orders)
│   │   └── seed.sql            # Sample categories, products, and promo coupons
│   └── src/
│       ├── config/             # DB pool (db.js) & idempotent startup initializer (initDb.js)
│       ├── controllers/        # auth, product, cart, order, coupon, admin controllers
│       ├── middleware/         # JWT auth & requireAdmin role guard
│       ├── routes/             # API route modules
│       ├── utils/              # Shared order & coupon pricing calculator
│       ├── app.js              # Express app & SPA static fallback
│       └── server.js           # Server entrypoint
├── scripts/                    # Local PostgreSQL launcher (db.js) & DB inspector (view_db.js)
└── package.json                # Root workspace scripts
```

---

## Setup & Installation

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **PostgreSQL** (v14+ or v18)

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/Astha38/Invoqe_ShopEase.git
cd Invoqe_ShopEase
npm install
npm install --prefix server
npm install --prefix client
```

### 3. Configure Environment Variables
Create `server/.env` based on [server/.env.example](server/.env.example):
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
DATABASE_URL=postgresql://postgres:shop12345@localhost:5432/shopease
```
*(If using the local `pgdata/` cluster via `npm run dev:db`, set the port in `DATABASE_URL` to `5434`.)*

### 4. Initialize Database Schema & Seed Data
Run the SQL schema and seed scripts against your PostgreSQL `shopease` database:
```bash
psql -U postgres -d shopease -f server/sql/schema.sql
psql -U postgres -d shopease -f server/sql/seed.sql
```
On server startup, [server/src/config/initDb.js](server/src/config/initDb.js) also ensures required tables, default promo codes, and the demo admin account exist automatically.

### 5. Run the Application

**Option A — Run PostgreSQL + Backend + Frontend together (local cluster):**
```bash
npm run dev
```

**Option B — Run Backend and Frontend with an existing PostgreSQL service:**
```bash
npm run dev:server
npm run dev:client
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`

### Production Build
```bash
npm run build:client
npm start --prefix server
```

---

## API Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a customer account |
| `POST` | `/api/auth/login` | Public | Log in and receive JWT |
| `GET` | `/api/auth/me` | Auth | Get current user profile & role |
| `GET` | `/api/products` | Public | List products (`?search=`, `?category=`) |
| `GET` | `/api/products/:id` | Public | Get single product details |
| `POST/PUT/DELETE` | `/api/products/:id` | Admin | Create, update, or deactivate products |
| `GET` | `/api/categories` | Public | List all categories |
| `GET/POST/PATCH/DELETE` | `/api/cart...` | Auth | View and manage user cart items |
| `GET` | `/api/coupons/active` | Public | List active promo codes |
| `POST` | `/api/coupons/validate` | Public | Validate coupon and compute discount |
| `POST/GET` | `/api/orders` | Auth | Place order (with coupon & payment) or list user orders |
| `GET/PATCH/POST/DELETE` | `/api/admin/...` | Admin | Dashboard stats, order status updates, users, coupons |

---

## Usage Guide

### Customer Flow
1. Browse products on `/`, filter by category, or search by keyword.
2. Click **❤️** to save items to **Favorites (`/favorites`)**, or open a product page to select quantity and **Add to Cart**.
3. Register or log in (`/register` or `/login`).
4. Go to **Cart (`/cart`)**, apply a promo code (`WELCOME10`, `FREESHIP`, or `SAVE200`), enter your shipping address, choose **UPI**, **Card**, or **COD**, and place your order.
5. Track live order status and shipment tracking numbers on **My Orders (`/orders`)**.

### Admin Flow
1. Log in at `/login` with the seeded demo admin credentials (configurable via `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars):
   - **Email**: `admin@shopease.com`
   - **Password**: `admin123`
2. Open **Admin Panel (`/admin`)** to view revenue analytics, restock low-inventory products, update customer order statuses (`pending` → `paid` → `shipped` → `delivered`), and manage promo coupons.
