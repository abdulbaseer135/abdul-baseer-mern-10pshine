# 📝 Notes App — Professional MERN Stack Application

![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat)
![Code Quality](https://img.shields.io/badge/code_quality-SonarQube-brightgreen?style=flat&logo=sonarqube)
![Coverage](https://img.shields.io/badge/test_coverage-comprehensive-blue?style=flat)
![Node](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)
![License](https://img.shields.io/badge/license-MIT-blue)

A production-ready full-stack notes application built with the **MERN stack** (MongoDB, Express.js, React, Node.js). This project demonstrates professional software engineering practices including JWT authentication, Redux state management, comprehensive testing, RESTful API design, and secure password handling.

---

## 🎯 Project Overview

This Notes App is a comprehensive full-stack web application designed to demonstrate proficiency in:
- **Full-stack MERN development** with modern best practices
- **Authentication & Authorization** using JWT tokens with secure password hashing
- **State Management** using Redux Toolkit for predictable application state
- **API Design** following RESTful conventions with proper HTTP methods and status codes
- **Testing & Quality Assurance** with unit and integration tests using Mocha/Chai and Jest
- **Database Design** with Mongoose schemas and data validation
- **UI/UX** with responsive design using Tailwind CSS and TipTap rich text editor
- **Security** with password validation, JWT authentication, and error handling
- **Code Quality** monitored with SonarQube for continuous improvement

---

## ✨ Key Features

### User Authentication & Security
- 🔐 **JWT-based Authentication** — Secure signup and login with token-based sessions
- 🔒 **Strong Password Enforcement** — Client-side and server-side validation with specific requirements
- 🛡️ **Password Hashing** — Industry-standard bcryptjs for secure password storage
- 👤 **Profile Management** — Update name, change password, and delete account functionality
- 📱 **Responsive Authentication** — Secure token handling across all device sizes

### Note Management
- 📝 **Rich Text Editing** — TipTap editor supporting bold, italic, lists, headings, and formatting
- 🗂️ **Full CRUD Operations** — Create, read, update, and delete notes seamlessly
- 🔍 **Search Functionality** — Filter and find notes quickly
- 📄 **Pagination** — Efficient data loading with pagination support
- 💾 **Auto-save Ready** — Architecture supports real-time updates

### Technical Excellence
- 🏗️ **Clean Architecture** — Separation of concerns with controllers, services, and DAL layers
- 📊 **Comprehensive Logging** — Structured logging with Pino for debugging and monitoring
- 🧪 **Test Coverage** — Unit and integration tests for critical functionality
- ♻️ **Reusable Components** — Modular UI components for maintainability
- 🎨 **Type-Safe Forms** — React Hook Form with validation

---

## 🛠️ Tech Stack & Architecture

### Frontend — React 18 + Redux
| Technology | Purpose | Version |
|---|---|---|
| **React** | Component-based UI framework with hooks | 18.2.0 |
| **Redux Toolkit** | Predictable state management with slices | 2.11.2 |
| **React Router v6** | Client-side routing and navigation | 6.30.3 |
| **TipTap** | Rich text editor with extensible plugins | 3.22.4 |
| **React Hook Form** | Lightweight form validation and management | 7.73.1 |
| **Tailwind CSS** | Utility-first CSS for responsive design | 3.4.19 |
| **Axios** | Promise-based HTTP client with interceptors | 1.15.2 |
| **Socket.io Client** | Real-time communication support | 4.8.3 |
| **Jest & React Testing Library** | Component and integration testing | 29.7.0 |

### Backend — Node.js + Express
| Technology | Purpose | Version |
|---|---|---|
| **Express.js** | Minimal and flexible web application framework | 5.2.1 |
| **MongoDB + Mongoose** | NoSQL database with schema validation | 9.4.1 |
| **JWT (jsonwebtoken)** | Secure token generation and verification | 9.0.3 |
| **bcryptjs** | Industry-standard password hashing | 3.0.3 |
| **Pino** | Structured, high-performance JSON logging | 10.3.1 |
| **Joi** | Data schema validation | 18.1.2 |
| **Multer** | Middleware for file upload handling | 1.4.5 |
| **Socket.io** | Real-time bidirectional communication | 4.8.3 |
| **Nodemailer** | Email sending capability | 6.9.7 |

### Testing & Code Quality
| Technology | Purpose |
|---|---|
| **Mocha** | Flexible test framework for backend |
| **Chai** | BDD/TDD assertion library |
| **Supertest** | HTTP assertion library for API testing |
| **NYC** | Code coverage reporting |
| **SonarQube** | Static code analysis and quality metrics |
| **Jest** | JavaScript testing framework (frontend) |

### Development Tools
| Tool | Purpose |
|---|---|
| **Nodemon** | Auto-restart during development |
| **Postman** | API testing and documentation |
| **Git & GitHub** | Version control and collaboration |

---

## 📁 Project Structure & Architecture

```
abdul-baseer-mern-10pshine/
│
├── backend/                          # Express.js REST API Server
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   │   ├── db.js                 # MongoDB connection setup
│   │   │   ├── env.js                # Environment variables validation
│   │   │   ├── logger.js             # Pino logger configuration
│   │   │   └── socket.js             # Socket.io setup
│   │   │
│   │   ├── controllers/              # Request handlers (Business logic)
│   │   │   ├── auth.controller.js    # Authentication endpoints
│   │   │   ├── notes.controller.js   # Note CRUD operations
│   │   │   ├── profile.controller.js # Profile management
│   │   │   └── users.controller.js   # User operations
│   │   │
│   │   ├── services/                 # Business logic layer
│   │   │   └── *.service.js          # Service methods for controllers
│   │   │
│   │   ├── dal/                      # Data Access Layer (Database queries)
│   │   │   ├── notes.dal.js          # Note database operations
│   │   │   └── users.dal.js          # User database operations
│   │   │
│   │   ├── models/                   # Mongoose schemas
│   │   │   ├── User.js               # User schema with validation
│   │   │   └── Note.js               # Note schema with timestamps
│   │   │
│   │   ├── middleware/               # Express middleware
│   │   │   ├── auth.middleware.js    # JWT verification & validation
│   │   │   ├── errorHandler.middleware.js  # Centralized error handling
│   │   │   ├── requestLogger.middleware.js # HTTP request logging
│   │   │   └── validate.middleware.js     # Request validation
│   │   │
│   │   ├── routes/                   # Express route definitions
│   │   │   ├── auth.routes.js        # Authentication routes
│   │   │   ├── notes.routes.js       # Note management routes
│   │   │   └── users.routes.js       # User profile routes
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── ApiError.js           # Custom error class
│   │   │   ├── ApiResponse.js        # Standardized response format
│   │   │   └── asyncHandler.js       # Async route wrapper
│   │   │
│   │   ├── migrations/               # Database migrations
│   │   │   ├── backfillNoteId.js     # Data migration scripts
│   │   │   └── fixShareTokenIndex.js # Schema update migrations
│   │   │
│   │   ├── app.js                    # Express app setup & middleware
│   │   └── server.js                 # Server entry point
│   │
│   ├── tests/                        # Mocha/Chai test suites
│   │   ├── unit/                     # Unit tests for services
│   │   ├── integration/              # Integration tests for APIs
│   │   └── helpers/                  # Test utilities & fixtures
│   │
│   ├── uploads/                      # File upload storage
│   │   └── profiles/                 # User profile pictures
│   │
│   ├── coverage/                     # Test coverage reports
│   │   └── lcov-report/              # HTML coverage visualization
│   │
│   ├── .env.example                  # Environment template
│   ├── package.json                  # Backend dependencies
│   └── sonar.js                      # SonarQube scanner configuration
│
├── frontend/                         # React 18 Frontend Application
│   ├── src/
│   │   ├── components/               # Reusable React components
│   │   │   ├── forms/                # Form components (Login, Signup, etc.)
│   │   │   ├── modals/               # Modal dialogs
│   │   │   ├── navbar/               # Navigation components
│   │   │   ├── notes/                # Note display/edit components
│   │   │   └── common/               # Shared UI components
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.js            # Authentication state hook
│   │   │   ├── useNotes.js           # Notes management hook
│   │   │   └── useFetch.js           # Data fetching hook
│   │   │
│   │   ├── pages/                    # Page components (routes)
│   │   │   ├── Auth/                 # Authentication pages
│   │   │   ├── Dashboard/            # Main dashboard page
│   │   │   ├── Profile/              # User profile page
│   │   │   └── NotFound/             # 404 page
│   │   │
│   │   ├── services/                 # API service functions
│   │   │   ├── authService.js        # Auth API calls
│   │   │   ├── notesService.js       # Notes API calls
│   │   │   └── usersService.js       # User API calls
│   │   │
│   │   ├── store/                    # Redux state management
│   │   │   ├── slices/               # Redux slices
│   │   │   │   ├── authSlice.js      # Authentication state
│   │   │   │   └── notesSlice.js     # Notes state
│   │   │   └── index.js              # Store configuration
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── constants.js          # App constants
│   │   │   ├── validators.js         # Form validation rules
│   │   │   └── helpers.js            # Helper functions
│   │   │
│   │   ├── context/                  # React Context (if used)
│   │   ├── App.jsx                   # Main app component & routes
│   │   ├── index.jsx                 # React app entry point
│   │   ├── index.css                 # Global styles
│   │   └── setupTests.js             # Jest configuration
│   │
│   ├── public/                       # Static assets
│   │   └── index.html                # HTML template
│   │
│   ├── coverage/                     # Test coverage reports
│   │   └── lcov-report/              # HTML coverage visualization
│   │
│   ├── __mocks__/                    # Jest mock files
│   │   └── fileMock.js               # File import mocks
│   │
│   ├── .env.example                  # Environment template
│   ├── package.json                  # Frontend dependencies
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── postcss.config.js             # PostCSS configuration
│   └── jest.setup.js                 # Jest setup file
│
├── sonar-project.properties          # SonarQube project configuration
├── sonar-scan.ps1                    # PowerShell script for scanning
├── package.json                      # Root package (scripts orchestration)
└── README.md                         # Project documentation (this file)
```

### Architecture Pattern: MVC + Service Layer
- **Controllers** handle HTTP requests and delegate to services
- **Services** contain business logic and orchestrate operations
- **DAL (Data Access Layer)** handles database queries using Mongoose
- **Models** define database schemas with validation rules
- **Middleware** handles cross-cutting concerns (auth, logging, error handling)



---

## 🚀 Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** >= 18.x (includes npm)
- **MongoDB** (local installation or MongoDB Atlas cloud account)
- **Git** for cloning the repository
- **npm** >= 9.x

### Step 1: Clone the Repository
```bash
git clone https://github.com/<your-username>/abdul-baseer-mern-10pshine.git
cd abdul-baseer-mern-10pshine
```

### Step 2: Setup Backend Server
```bash
cd backend

# Copy environment variables template
cp .env.example .env

# Install dependencies
npm install

# Start development server with auto-reload
npm run dev
# Server runs at http://localhost:5000
```

### Step 3: Setup Frontend Application
```bash
cd ../frontend

# Copy environment variables template
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm start
# Application opens at http://localhost:3000
```

### Step 4: Verify Installation
1. Open your browser and navigate to `http://localhost:3000`
2. You should see the Notes App signup page
3. Create a new account to test the application
4. Start creating and managing notes!

### Quick Start (One Command)
For a faster setup, you can use the root package scripts:
```bash
# From project root
npm run sonar:coverage  # Run all tests with coverage
```

---

## 🔑 Environment Variables Configuration

### Backend Configuration — `backend/.env`

Create a `.env` file in the backend folder with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/notesapp
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/notesapp

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Logging Configuration
LOG_LEVEL=info

# File Upload Configuration (optional)
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes
```

### Frontend Configuration — `frontend/.env`

Create a `.env` file in the frontend folder with:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api/v1

# Optional: Feature flags
REACT_APP_ENABLE_SOCKET_IO=true
```

### Environment Variables Explanation

| Variable | Type | Purpose | Example |
|---|---|---|---|
| `PORT` | Number | Express server port | `5000` |
| `MONGO_URI` | String | MongoDB connection string (local or Atlas) | `mongodb://localhost:27017/notesapp` |
| `JWT_SECRET` | String | Secret key for signing JWT tokens (use strong random string) | `your_secret_key_min_32_chars` |
| `JWT_EXPIRES_IN` | String | Token expiration time | `7d` (7 days) |
| `NODE_ENV` | String | Environment mode (development/production) | `development` |
| `LOG_LEVEL` | String | Logging verbosity (info/debug/error) | `info` |
| `REACT_APP_API_URL` | String | Backend API base URL for frontend | `http://localhost:5000/api/v1` |

### Security Best Practices
⚠️ **Important:**
- Never commit `.env` files to version control
- Use strong, random values for JWT_SECRET in production
- Use MongoDB Atlas with proper authentication in production
- Rotate JWT_SECRET periodically in production
- Use HTTPS for all API calls in production

---

## 🧪 Testing & Code Quality

### Running Tests

#### Backend Tests (Mocha + Chai + Supertest)
```bash
cd backend

# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (auto-rerun on changes)
npm test -- --watch

# Generate coverage HTML report
npm run test:coverage
# View report at: coverage/lcov-report/index.html
```

#### Frontend Tests (Jest + React Testing Library)
```bash
cd frontend

# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm test -- --watchAll=false

# Generate coverage report
npm test -- --watchAll=false --coverage

# Run specific test file
npm test -- SomeComponent.test.jsx
```

#### Combined Coverage Report
```bash
# From project root
npm run sonar:coverage
# Generates coverage for both frontend and backend
```

### Test Structure

**Backend Tests:**
- `tests/unit/` — Unit tests for services and utilities
- `tests/integration/` — API endpoint integration tests
- Coverage target: >80% for critical paths

**Frontend Tests:**
- Component tests using React Testing Library
- Hook tests for custom React hooks
- Coverage target: >75% for components

### Code Quality Analysis

#### SonarQube Integration
```bash
# Start SonarQube (requires Docker)
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community

# Run analysis from project root
npm run sonar:analyze

# View results at http://localhost:9000
# Default credentials: admin/admin
```

#### What Gets Scanned
- Code coverage metrics
- Code smells and bugs
- Security vulnerabilities
- Duplication analysis
- Complexity metrics

### Test Coverage Goals
| Area | Target | Status |
|---|---|---|
| Backend Unit Tests | >80% | ✅ |
| Backend Integration Tests | >75% | ✅ |
| Frontend Components | >75% | ✅ |
| Critical Paths | 100% | ✅ |

---

## 📡 API Reference

All API endpoints follow RESTful conventions and return standardized JSON responses.

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer {token}
```

### Response Format
All responses follow a standardized format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "error": null
}
```

### Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "error": { "code": "ERROR_CODE", "details": {} }
}
```

---

### 🔐 Authentication Endpoints

#### Register New User
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```
**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "name": "..." },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### User Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
**Response:** `200 OK` — Returns user data and JWT token

#### User Logout
```http
POST /auth/logout
Authorization: Bearer {token}
```
**Response:** `200 OK`

---

### 👤 User Profile Endpoints

#### Get Current User Profile
```http
GET /users/profile
Authorization: Bearer {token}
```
**Response:** `200 OK` — User profile data

#### Update User Profile
```http
PUT /users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name"
}
```
**Response:** `200 OK` — Updated user data

#### Change Password
```http
PUT /users/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```
**Response:** `200 OK`

#### Delete Account
```http
DELETE /users/profile
Authorization: Bearer {token}
```
**Response:** `200 OK` — Account permanently deleted

---

### 📝 Notes Endpoints

#### Get All Notes (Paginated)
```http
GET /notes?page=1&limit=10&search=keyword
Authorization: Bearer {token}
```
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search notes by title or content

**Response:** `200 OK` — Array of notes with pagination info

#### Create New Note
```http
POST /notes
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "My Note",
  "content": "<p>Rich text content with <strong>formatting</strong></p>"
}
```
**Response:** `201 Created` — Created note object

#### Get Single Note
```http
GET /notes/:id
Authorization: Bearer {token}
```
**Response:** `200 OK` — Note details

#### Update Note
```http
PUT /notes/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "<p>Updated content</p>"
}
```
**Response:** `200 OK` — Updated note

#### Delete Note
```http
DELETE /notes/:id
Authorization: Bearer {token}
```
**Response:** `200 OK` — Confirmation message

---

### HTTP Status Codes & Meanings
| Code | Meaning | Scenario |
|---|---|---|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful resource creation (POST) |
| `400` | Bad Request | Invalid input or validation error |
| `401` | Unauthorized | Missing or invalid JWT token |
| `403` | Forbidden | Access denied (not note owner) |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate email during signup |
| `500` | Server Error | Internal server error |

---

### Example: Complete Login & Create Note Flow

```bash
# 1. Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'
# Response contains token

# 2. Create Note (using token from login)
curl -X POST http://localhost:5000/api/v1/notes \
  -H "Authorization: Bearer {token_from_login}" \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Note","content":"<p>Hello World</p>"}'

# 3. Get All Notes
curl -X GET http://localhost:5000/api/v1/notes?page=1 \
  -H "Authorization: Bearer {token_from_login}"
```

---

## � Code Quality & SonarQube Analysis

### Setting Up SonarQube Locally

#### Option 1: Docker (Recommended)
```bash
# Start SonarQube community edition
docker run -d \
  --name sonarqube \
  -p 9000:9000 \
  sonarqube:lts-community

# Wait ~1 minute for startup
# Access at http://localhost:9000
# Default credentials: admin / admin
```

#### Option 2: Manual Installation
```bash
# Download from https://www.sonarqube.org/downloads/
# Extract and run from bin/
./bin/linux-x86-64/sonar.sh start
```

### Running Code Analysis

```bash
# From project root - Generate coverage reports
npm run sonar:coverage

# Run SonarQube scanner
npm run sonar:scan

# Or run both at once
npm run sonar:analyze
```

### Accessing Results
1. Open http://localhost:9000
2. Login with credentials (admin/admin initially)
3. View:
   - Code coverage percentage
   - Security vulnerabilities
   - Code smells and bugs
   - Complexity metrics
   - Duplication statistics

### Quality Gates Monitoring
- **Code Coverage:** Target >75%
- **Code Smells:** Keep below 3%
- **Vulnerabilities:** Zero critical issues
- **Bugs:** Minimal and tracked
- **Duplication:** <5%

---

## 💡 Key Implementation Highlights

### Authentication System
- ✅ JWT-based stateless authentication
- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ Token stored in httpOnly cookies (secure)
- ✅ Automatic token refresh mechanism
- ✅ Protected routes with middleware verification

### State Management (Redux)
- ✅ Redux Toolkit with slices for cleaner code
- ✅ Async thunks for API calls
- ✅ Normalized state structure
- ✅ DevTools integration for debugging
- ✅ Persistent auth state across page reloads

### Database Design
- ✅ MongoDB Mongoose schema validation
- ✅ Proper indexing for performance
- ✅ Cascading deletes for data integrity
- ✅ Timestamps (createdAt, updatedAt) for auditing
- ✅ User-note relationship with references

### Error Handling
- ✅ Centralized error middleware
- ✅ Custom ApiError class for consistency
- ✅ Proper HTTP status codes
- ✅ Meaningful error messages
- ✅ Stack traces in development mode

### Security Implementations
- ✅ CORS configuration
- ✅ Password validation rules (min 8 chars, uppercase, number, special)
- ✅ Rate limiting ready (middleware structure)
- ✅ SQL injection prevention via Mongoose
- ✅ XSS protection with proper input validation

### Rich Text Editing
- ✅ TipTap editor with extensions
- ✅ Support for: Bold, Italic, Lists, Headings, Links
- ✅ HTML sanitization for security
- ✅ Collaborative editing ready
- ✅ Undo/Redo functionality

---

## 📦 Deployment Guide

### Frontend Deployment (Vercel / Netlify)

#### Environment Variables for Production
```env
REACT_APP_API_URL=https://your-api-domain.com/api/v1
REACT_APP_ENABLE_ANALYTICS=true
```

#### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Deploy to Netlify
```bash
# Build production bundle
cd frontend
npm run build

# Deploy build folder to Netlify
# Or use Netlify CLI:
npm i -g netlify-cli
netlify deploy --prod --dir=build
```

### Backend Deployment (Heroku / Railway / Render)

#### Environment Setup
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=<your-strong-secret-key>
PORT=5000
```

#### Deploy to Render
```bash
# Create account at https://render.com
# Connect GitHub repo
# Set environment variables
# Deploy!
```

#### Deploy to Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

---

## 📚 Learning Resources & Documentation

### Frontend
- [React Documentation](https://react.dev)
- [Redux Toolkit Guide](https://redux-toolkit.js.org)
- [React Router v6](https://reactrouter.com)
- [TipTap Editor](https://tiptap.dev)
- [Tailwind CSS](https://tailwindcss.com)

### Backend
- [Express.js Guide](https://expressjs.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [JWT.io](https://jwt.io)
- [Pino Logger](https://getpino.io)

### Testing
- [Mocha Documentation](https://mochajs.org)
- [Jest Testing](https://jestjs.io)
- [React Testing Library](https://testing-library.com/react)

---

## 🤝 Contributing

This project is open for improvements and contributions. To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

### Code Style Guidelines
- Use ESLint for code consistency
- Follow the existing folder structure
- Write tests for new features
- Ensure >80% code coverage
- Update documentation with changes

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author & Contact

**Abdul Baseer**
- **Education:** BS Computer Science (F22)
- **Internship:** 10P Shine — MERN Stack Development Track


### 📧 Get In Touch
- GitHub: [@abdul-baseer135](https://github.com/abdulbaseer135)
- Email: abdulbaseerk135@gmail.com
- LinkedIn: https://www.linkedin.com/in/abdul-baseer-2474b8265/

---

## 🙏 Acknowledgments

Special thanks to:
- **10P Shine** for the internship opportunity and mentorship





### Version 1.0.0 (Current)
- ✅ Complete MERN stack implementation
- ✅ JWT authentication system
- ✅ Rich text editor integration
- ✅ Comprehensive test coverage
- ✅ SonarQube integration
- ✅ Responsive UI design
- ✅ Professional documentation

---

**Last Updated:** May 31, 2026

If you find this project helpful, please consider giving it a star on GitHub!