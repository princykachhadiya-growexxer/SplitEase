# SplitEase 💸

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

**A full-stack expense splitting web app — track shared costs, settle debts, and stop doing mental math.**

[Live Demo](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [API Reference](#-api-reference)
- [Author](#-author)

---

## 🌟 Overview

**SplitEase** is a production-grade, Splitwise-inspired expense management app built on the MERN stack. It lets groups of friends, roommates, or colleagues track shared expenses, automatically compute who owes what, and record settlements — all without a spreadsheet in sight.

Whether you're splitting a vacation rental, monthly utilities, or a dinner bill, SplitEase handles the maths and keeps everyone on the same page.

> Built with clean architecture, JWT-based authentication, a smart balance engine with debt simplification, and a polished UI with full light/dark mode support.

---


---

## ✨ Features

- **🔐 JWT Auth** — token validated on every protected route, invalid tokens redirect to login
- **👥 Groups** — create, view, add/remove members, delete
- **💰 Expenses** — add with equal split, categorised, delete
- **📊 Balance Engine** — dynamic net balance computation per member
- **🔄 Debt Simplification** — greedy algorithm minimises number of transactions
- **🤝 Settle Up** — record payments, balances update instantly
- **📱 Responsive UI** — fixed sidebar on desktop, hamburger drawer on mobile
- **🎨 Color-coded balances** — green = owed, red = owes

---


## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6 |
| **Styling** | Tailwind CSS 3, CSS Custom Properties |
| **State** | React Context API + Hooks |
| **HTTP Client** | Axios (with request/response interceptors) |
| **Backend** | Node.js, Express 4 |
| **Database** | MongoDB, Mongoose 8 |
| **Auth** | JSON Web Tokens (JWT), bcryptjs |
| **Notifications** | react-hot-toast |
| **Icons** | lucide-react |


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

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed before proceeding:

| Tool | Version | Download |
|---|---|---|
| Node.js | v18+ | [nodejs.org](https://nodejs.org) |
| MongoDB | v6+ | [mongodb.com](https://mongodb.com) or [Atlas](https://www.mongodb.com/atlas) |
| npm | v9+ | Included with Node.js |

### Installation

---

## 🚀 Setup & Run

### 1. Clone / extract the project

```bash
cd splitwise
```

### 2. Backend setup

```bash
cd server
touch .env          # Edit .env with your values
npm install
npm run dev                  
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
npm run dev                 
```

The Vite dev server proxies `/api` requests to `localhost:5000` automatically.

---


## 🌐📡 API Reference

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



## 👤 Author

**Your Name**

[![GitHub](https://img.shields.io/badge/GitHub-@your--username-181717?style=flat-square&logo=github)](https://github.com/your-username)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/your-name)
[![Portfolio](https://img.shields.io/badge/Portfolio-yourwebsite.com-16a34a?style=flat-square&logo=google-chrome&logoColor=white)](https://yourwebsite.com)

---

<div align="center">

If SplitEase saved you from a spreadsheet, please consider giving it a ⭐

</div>