# LUMÉA BEAUTY — Cosmetic E-Commerce Platform

A full-stack cosmetics e-commerce site: a premium customer storefront plus an
admin dashboard for managing the shop, all backed by a real REST API and
MongoDB database.

## Technologies

- React
- Tailwind CSS
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt

## Features

### Customer
- Home, Shop (search, category/price/rating filters, sorting, pagination),
  Product Details, Cart, Wishlist, and a multi-step Checkout — all backed by
  live data from MongoDB.
- Register / Login / Logout with JWT authentication; a My Account page for
  viewing and updating your profile; My Orders for order history.
- Coupon codes applied at checkout against real, admin-managed coupons
  (with minimum-order, maximum-discount, expiry, and usage-limit rules).
- Guest-friendly cart and wishlist (stored locally in the browser); logged-in
  users additionally get their orders persisted so they show up under My
  Orders and in the admin dashboard.

### Admin (`/admin`, ADMIN role only)
- Dashboard with real revenue/orders/customers/products/pending-orders/
  low-stock summary cards.
- Analytics with revenue, orders, customer, and product-sales charts, filterable
  by Today / Last 7 Days / Last 30 Days / This Year.
- Product management: add, edit, delete, search, and stock/status at a glance.
- Category management: add, edit, delete, activate/deactivate.
- Order management: search and filter by status, view full order detail, and
  update order status (persisted to MongoDB, reflected back to the customer).
- Customer management: search, view profile/order history/total spend,
  activate/deactivate accounts (no password data is ever exposed).
- Coupon management: create, edit, delete, activate/deactivate.
- Review moderation: approve, hide, or delete submitted reviews.

## Project Structure

```
lumea-beauty/
├── client/    React (Vite) frontend — customer storefront + admin dashboard
│   └── src/
│       ├── pages/        Customer-facing pages (Home, Shop, Cart, Checkout, ...)
│       ├── admin/         Admin dashboard (layout, pages, components)
│       ├── components/    Shared UI, layout, product, shop, checkout components
│       ├── context/        React Context: Auth, Cart, Wishlist, Toast
│       ├── services/       API client + one service module per resource
│       └── hooks/           Small shared hooks (e.g. usePageTitle)
│
└── server/    Node.js + Express + Mongoose REST API
    ├── models/         Mongoose schemas (User, Product, Category, Order, Coupon, Review)
    ├── controllers/    Route handlers, one file per resource
    ├── routes/          Express routers (admin routes require JWT + ADMIN role)
    ├── middleware/      Auth (protect/authorizeRoles), error handling, 404
    ├── config/           Environment + DB connection
    └── seed/             Seed script + demo data
```

## Installation

1. **Clone the project**
   ```
   git clone <repository-url>
   cd lumea-beauty
   ```
2. **Install frontend dependencies**
   ```
   cd client
   npm install
   ```
3. **Install backend dependencies**
   ```
   cd ../server
   npm install
   ```
4. **Configure environment variables** — copy each `.env.example` to `.env`
   and fill in your own values (see below).
   ```
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```
5. **Start MongoDB** — have a MongoDB instance running (local install or a
   connection string from a hosted service) and put its URI in
   `server/.env` as `MONGODB_URI`.
6. **Seed the database** (from `server/`)
   ```
   npm run seed
   ```
   This populates categories, demo products, two demo coupons, and creates
   one ADMIN account for testing (see `ADMIN_EMAIL` / `ADMIN_PASSWORD` in
   `server/.env.example` — there is no public sign-up path to an admin
   account, by design).
7. **Start the backend** (from `server/`)
   ```
   npm run dev
   ```
   Runs on `http://localhost:5000` by default.
8. **Start the frontend** (from `client/`, in a separate terminal)
   ```
   npm run dev
   ```
   Runs on `http://localhost:5173` by default.

## Environment Variables

### `server/.env`
| Variable | Purpose |
|---|---|
| `PORT` | Port the API listens on. Defaults to `5000`. |
| `MONGODB_URI` | Your MongoDB connection string. Required — the server refuses to start meaningfully without it. |
| `JWT_SECRET` | Secret used to sign/verify JWTs. Required — the server fails to start if this is missing, since running without one would sign tokens insecurely. Use a long, random value in any real deployment. |
| `CLIENT_URL` | The frontend's origin, used for CORS. Defaults to `http://localhost:5173`. |
| `LOW_STOCK_THRESHOLD` | Stock at or below this number is flagged "Low Stock" across the admin dashboard. Defaults to `10`. |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PHONE`, `ADMIN_PASSWORD` | Used only by `npm run seed` to create/upgrade one ADMIN account for testing. Sensible defaults are used if unset — change `ADMIN_PASSWORD` before using this anywhere but locally. |

### `client/.env`
| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Base URL of the backend API. Defaults to `http://localhost:5000/api`. |

No secrets (database credentials, JWT secret, etc.) are ever sent to the
frontend or committed to the repository — `.env` is git-ignored in both
`client/` and `server/`, and only placeholder values live in `.env.example`.

## Running

| Task | Command | Where |
|---|---|---|
| Install dependencies | `npm install` | `client/` and `server/`, separately |
| Seed the database | `npm run seed` | `server/` |
| Run backend (dev, auto-restart) | `npm run dev` | `server/` |
| Run backend (production) | `npm start` | `server/` |
| Run frontend (dev) | `npm run dev` | `client/` |
| Build frontend for production | `npm run build` | `client/` |
| Preview the production build | `npm run preview` | `client/` |
| Lint the frontend | `npm run lint` | `client/` |

## Project Status

Customer storefront, authentication, and admin dashboard are complete and
connected to a real MongoDB-backed API — see Features above. Not yet built:
a payment gateway (checkout currently completes without one).
