# 📝 Notes App — MERN Stack

![SonarQube](https://img.shields.io/badge/SonarQube-passing-brightgreen?style=flat&logo=sonarqube)
![Node](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![License](https://img.shields.io/badge/license-MIT-blue)

A full-stack notes application built with the MERN stack featuring rich text editing, JWT authentication, Redux state management, and comprehensive test coverage.

---

## ✨ Features

- 🔐 JWT Authentication (Signup, Login, Logout)
- 🔒 Strong password enforcement (frontend + backend)
- 📝 Rich text editor (TipTap) with bold, italic, lists, headings
- 🗂️ Create, Read, Update, Delete notes
- 🔍 Search and paginate notes
- 👤 Profile management (update name, change password, delete account)
- 🛡️ Protected routes via Redux auth state
- 📱 Responsive UI with Tailwind CSS

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Redux Toolkit | Global state management |
| React Router v6 | Client-side routing |
| TipTap | Rich text editor |
| React Hook Form | Form validation |
| Tailwind CSS | Styling |
| Axios | HTTP client |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database + ODM |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| Pino | Structured logging |
| Mocha + Chai | Unit testing |

---

## 📁 Project Structure


abdul-baseer-mern-10pshine/
├── backend/
│ ├── src/
│ │ ├── config/ # DB, logger, env config
│ │ ├── controllers/ # Route handlers
│ │ ├── dal/ # Data access layer
│ │ ├── middleware/ # Auth, error handlers
│ │ ├── models/ # Mongoose schemas
│ │ ├── routes/ # Express routes
│ │ ├── services/ # Business logic
│ │ └── utils/ # ApiError, ApiResponse, asyncHandler
│ ├── tests/ # Mocha test suites
│ ├── .env.example
│ └── package.json
├── frontend/
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── hooks/ # Custom React hooks
│ │ ├── pages/ # Page components
│ │ ├── services/ # API service functions
│ │ ├── store/ # Redux store + slices
│ │ └── utils/ # Helpers, constants
│ ├── .env.example
│ └── package.json
├── sonar-project.properties
└── README.md



---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- npm >= 9

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/abdul-baseer-mern-10pshine.git
cd abdul-baseer-mern-10pshine
```

### 2. Setup Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev                 # http://localhost:5000
```

### 3. Setup Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm start                   # http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend — `backend/.env`

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/notesapp` |
| `JWT_SECRET` | Secret key for JWT signing | `your_super_secret_key` |
| `JWT_EXPIRES_IN` | Token expiry duration | `7d` |
| `NODE_ENV` | Environment mode | `development` |
| `LOG_LEVEL` | Pino log level | `info` |

### Frontend — `frontend/.env`

| Variable | Description | Example |
|---|---|---|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000/api/v1` |

---

## 🧪 Running Tests

### Backend (Mocha + Chai)
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend (Jest + React Testing Library)
```bash
cd frontend
npm test
npm test -- --watchAll=false --coverage
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/signup` | ❌ | Register new user |
| `POST` | `/api/v1/auth/login` | ❌ | Login and get JWT |
| `POST` | `/api/v1/auth/logout` | ✅ | Logout user |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/users/profile` | ✅ | Get profile |
| `PUT` | `/api/v1/users/profile` | ✅ | Update name |
| `DELETE` | `/api/v1/users/profile` | ✅ | Delete account |
| `PUT` | `/api/v1/users/change-password` | ✅ | Change password |

### Notes
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/notes` | ✅ | Get all notes (paginated) |
| `POST` | `/api/v1/notes` | ✅ | Create note |
| `GET` | `/api/v1/notes/:id` | ✅ | Get single note |
| `PUT` | `/api/v1/notes/:id` | ✅ | Update note |
| `DELETE` | `/api/v1/notes/:id` | ✅ | Delete note |

### Error Codes
| Code | Meaning |
|---|---|
| `400` | Validation error |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not found |
| `409` | Conflict (duplicate email) |
| `500` | Server error |

---

## 📊 SonarQube Analysis

```bash
# Start SonarQube (Docker)
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community

# Run scanner from project root
node backend/sonar.js
```
View results at `http://localhost:9000`

---

## 👤 Author

**Abdul Baseer** — 4562-FOC/BSCS/F22
Internship: 10P Shine — MERN Stack Track