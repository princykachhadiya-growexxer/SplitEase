# SplitEase — Splitwise Clone (MERN Stack)

A production-quality expense-splitting app built with MongoDB, Express, React, and Node.js.

---

## 🗂 Project Structure

```
splitwise/
├── server/          # Node.js + Express backend
│   ├── config/      # Database connection
│   ├── controllers/ # Route handlers / business logic
│   ├── middleware/  # Auth + error handling
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API route definitions
│   ├── services/    # Balance computation logic
│   ├── utils/       # JWT helpers
│   └── server.js    # Entry point
│
└── client/          # React + Vite + Tailwind frontend
    └── src/
        ├── components/
        │   ├── layout/  # Sidebar, AppLayout
        │   └── ui/      # Modal, Spinner, StatCard, etc.
        ├── context/     # AuthContext
        ├── pages/       # All page components
        ├── services/    # Axios instance
        └── App.jsx      # Router setup
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** running locally on `mongodb://localhost:27017` (or a MongoDB Atlas URI)

---

## 🚀 Setup & Run

### 1. Clone / extract the project

```bash
cd splitwise
```

### 2. Backend setup

```bash
cd server
cp .env.example .env          # Edit .env with your values
npm install
npm run dev                   # Starts on http://localhost:5000
```

**`.env` variables:**

| Variable      | Default                              | Description               |
|---------------|--------------------------------------|---------------------------|
| `PORT`        | `5000`                               | Server port               |
| `MONGODB_URI` | `mongodb://localhost:27017/splitwise` | MongoDB connection string |
| `JWT_SECRET`  | *(change this!)*                     | Secret for JWT signing    |
| `JWT_EXPIRE`  | `7d`                                 | Token expiry duration     |
| `NODE_ENV`    | `development`                        | Environment               |

### 3. Frontend setup

```bash
cd client
npm install
npm run dev                   # Starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `localhost:5000` automatically.

---

## 🌐 API Endpoints

| Method | Endpoint                                | Description               |
|--------|-----------------------------------------|---------------------------|
| POST   | `/api/auth/register`                   | Register a new user       |
| POST   | `/api/auth/login`                      | Login                     |
| GET    | `/api/auth/me`                         | Get current user          |
| GET    | `/api/users?search=`                   | Search users              |
| POST   | `/api/groups`                          | Create group              |
| GET    | `/api/groups`                          | Get user's groups         |
| GET    | `/api/groups/:id`                      | Get group detail          |
| POST   | `/api/groups/:id/members`              | Add member                |
| DELETE | `/api/groups/:id/members/:userId`      | Remove member             |
| DELETE | `/api/groups/:id`                      | Delete group              |
| POST   | `/api/expenses`                        | Add expense               |
| GET    | `/api/expenses/group/:groupId`         | Get group expenses        |
| GET    | `/api/expenses/group/:groupId/balances`| Get balances              |
| DELETE | `/api/expenses/:id`                    | Delete expense            |
| POST   | `/api/settlements`                     | Record settlement         |
| GET    | `/api/settlements/group/:groupId`      | Get group settlements     |

---

## ✨ Features

- **JWT Auth** — token validated on every protected route, invalid tokens redirect to login
- **Groups** — create, view, add/remove members, delete
- **Expenses** — add with equal split, categorised, delete
- **Balance Engine** — dynamic net balance computation per member
- **Debt Simplification** — greedy algorithm minimises number of transactions
- **Settle Up** — record payments, balances update instantly
- **Responsive UI** — fixed sidebar on desktop, hamburger drawer on mobile
- **Color-coded balances** — green = owed, red = owes

---

## 🛠 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Backend    | Node.js, Express, Mongoose        |
| Database   | MongoDB                           |
| Auth       | JWT + bcryptjs                    |
| Frontend   | React 18, Vite                    |
| Styling    | Tailwind CSS                      |
| HTTP       | Axios                             |
| Routing    | React Router v6                   |
| Toast      | react-hot-toast                   |
| Icons      | lucide-react                      |
