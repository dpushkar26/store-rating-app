# Store Rater Pro - Full Stack Store Rating Platform

A full-stack web application designed for discovering, rating, and managing stores with role-based access control (RBAC). Built with a modern React frontend and a robust Node.js/Express backend backed by PostgreSQL and Prisma ORM.

---

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router DOM (v6), Zustand, React Hook Form, Zod, Axios
- **Backend:** Node.js, Express.js, Prisma ORM (v6), JSON Web Token (JWT), bcrypt
- **Database:** PostgreSQL (Neon Cloud / Local)
- **Validation:** Zod (shared validation schemas on client and server)

---

## Features & Roles

### 1. System Administrator
- **Platform Analytics:** Real-time metrics tracking total registered users, stores, and submitted ratings.
- **User Management:** Create new users (`NORMAL_USER`, `STORE_OWNER`, `SYSTEM_ADMIN`) with strict validation.
- **Store Management:** Register new stores and assign them to verified store owners.
- **Directory & Filters:** Search and filter users by Name, Email, Address, and Role; filter stores by Name, Contact Email, and Address.
- **Multi-Column Sorting:** Sort tables by Name, Email, Address, Role, and Store Ratings (ascending/descending).

### 2. Normal User (Customer)
- **Account Registration:** Sign up with name, email, address, and secure password.
- **Store Directory:** Search stores by Name and Address with debounced real-time queries.
- **Dual Display:** Switch seamlessly between Grid View and Table View.
- **Interactive Ratings:** Submit new ratings (1–5 stars) or modify existing ratings with optimistic UI updates.
- **Sortable Store List:** Sort by Name, Address, Overall Rating, and My Submitted Rating.
- **Password Management:** Update account password anytime while logged in.

### 3. Store Owner
- **Store Dashboard:** View real-time store performance including Average Rating and Total Ratings Received.
- **Rater Details:** Comprehensive table listing all customers who rated the store, including their name, email, rating score, and timestamp.
- **Sortable History:** Sort raters by Name, Email, Score, or Date.
- **Password Management:** Change password securely from the navigation bar.

---

## Form Validation Rules

Enforced using Zod on both client and server:
- **Full Name:** Minimum 20 characters, Maximum 60 characters.
- **Address:** Maximum 400 characters.
- **Password:** 8–16 characters, at least one uppercase letter and at least one special character (`!@#$%^&*`).
- **Email:** Valid RFC email format.
- **Rating Score:** Integer between 1 and 5.

---

## Project Structure

```
store-rating-platform/
├── client/                     # Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, RatingForm, Modal, etc.)
│   │   ├── pages/              # Role-specific dashboard & auth pages
│   │   ├── services/           # Axios instance & interceptors
│   │   ├── store/              # Zustand global authentication store
│   │   ├── App.jsx             # Route definitions & ProtectedRoute guards
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind CSS directives
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite configuration
│   └── package.json
│
├── server/                     # Backend API
│   ├── prisma/
│   │   ├── schema.prisma       # Database models & relationships
│   │   └── seed.js             # Initial database seed script
│   ├── src/
│   │   ├── config/             # Database client setup
│   │   ├── controllers/        # Request handlers (auth, user, store, rating, dashboard)
│   │   ├── middlewares/        # Authentication, authorization (RBAC), and validation
│   │   ├── routes/             # Express API routes
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── utils/              # Password hashing & JWT helpers
│   │   └── app.js              # Express app entry & middleware pipeline
│   ├── .env.example            # Environment variables template
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database instance

---

### Backend Setup

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Configure your environment variables:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<database>?schema=public"
   JWT_SECRET="your_strong_jwt_secret"
   ```

4. Push the Prisma schema to your database:
   ```bash
   npx prisma db push
   ```

5. Seed the default System Administrator:
   ```bash
   npm run seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```
   *The server will be running on `http://localhost:5000`.*

---

### Frontend Setup

1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   *The client will be running on `http://localhost:3000`.*

---

## Default Seed Credentials

After running `npm run seed`, you can immediately log in with:
- **Role:** System Administrator
- **Email:** `admin@storerater.com`
- **Password:** `Admin@123!`

---

## API Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/register` | Register normal user account | No |
| `POST` | `/api/v1/auth/login` | Authenticate user & receive JWT | No |
| `PATCH`| `/api/v1/auth/password` | Update current user's password | Yes |
| `GET`  | `/api/v1/dashboard/admin` | Fetch platform statistics | Admin |
| `GET`  | `/api/v1/dashboard/owner` | Fetch store metrics & raters | Store Owner |
| `GET`  | `/api/v1/users` | List users with filters and sorting | Admin |
| `POST` | `/api/v1/users` | Create user with explicit role | Admin |
| `GET`  | `/api/v1/stores` | List stores with search & sorting | Yes |
| `POST` | `/api/v1/stores` | Create store assigned to owner | Admin |
| `PUT`  | `/api/v1/ratings/:storeId` | Upsert rating (1–5) for a store | Normal User |
