# Testora — Smart Aptitude Preparation and Online Test System

Testora is a full-stack academic project built for college students, faculty, and administrators. It provides a comprehensive platform for learning aptitude concepts, practicing topic-wise questions, attempting timed mock exams, managing customized teacher quizzes, and tracking student performance with automatic analytics and weak-topic detection.

---

## 🚀 Key Features

### 🎓 **Student Portal**
- **Dashboard**: Quick stats overview, recent test scores, weak topic highlights, and active teacher quiz notifications.
- **Concept Learning**: Category & topic browsing with rich study cards containing formulas, step-by-step examples, and key takeaways.
- **Topic Practice**: Interactive practice mode with immediate answer feedback, scoring, and detailed explanations.
- **Mock Tests**: Full-length timed exams featuring a dynamic question palette (answered/review/unvisited), timer countdown, confirmation dialogs, and auto-submission upon timeout.
- **Teacher Quizzes**: Timed quizzes assigned by college faculty.
- **Instant Result & Solutions**: Comprehensive breakdown showing score percentage, time spent, positive/negative marks, correctness status, and full solution explanations.
- **Performance Analytics**: Visual charts powered by Recharts showing accuracy trends, topic proficiency, and subject-wise weak points.
- **Profile Management**: Personal details editor and password security updates.

### 👩‍🏫 **Teacher Portal**
- **Faculty Dashboard**: Class performance metrics, total student submissions, and active quiz tracking.
- **Quiz Management**: Create, publish, unpublish, and delete custom quizzes.
- **Flexible Quiz Creator**: Build quizzes manually or auto-import questions from the shared question bank.
- **Class Results & Analytics**: View individual student scores, pass/fail status, submission timestamps, and overall class statistics.
- **Question Bank Browser**: Search and filter questions by category, topic, and difficulty.

### 🛡️ **Admin Portal**
- **System Overview**: High-level metrics for total students, teachers, categories, topics, questions, and mock tests.
- **User Management**: Activate/deactivate student and faculty accounts; create and manage teacher credentials.
- **Category & Topic Management**: Full CRUD controls for subjects (Quantitative Aptitude, Logical Reasoning, Verbal Ability) and sub-topics.
- **Concept Editor**: Add and edit rich study cards with formulas, sample problems, and key rules.
- **Global Question Bank**: Add, edit, and delete questions with option management, difficulty tags, positive/negative marks, explanations, and **bulk CSV import**.
- **Mock Test Builder**: Create full-length mock tests with duration, total marks, passing marks, and question picker.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, React Router v6, TailwindCSS, React Icons, Recharts, React Hot Toast, Axios
- **Backend**: Node.js, Express.js, JWT Authentication, Bcrypt.js, Multer (CSV/File Uploads), Express Validator
- **Database**: MongoDB & Mongoose ORM
- **Language**: Standard Modern JavaScript (ES6+ / CommonJS / JSX) — *No TypeScript*

---

## 📁 Project Directory Structure

```text
Testora(Mini project)/
├── client/                     # Frontend React (Vite) Application
│   ├── src/
│   │   ├── components/        # Layout & reusable UI components
│   │   │   ├── common/        # LoadingSpinner, EmptyState
│   │   │   └── layout/        # DashboardLayout (Role-based Sidebar & Header)
│   │   ├── context/           # AuthContext (JWT state & API integration)
│   │   ├── pages/
│   │   │   ├── admin/         # AdminDashboard, AdminStudents, AdminTeachers, etc.
│   │   │   ├── auth/          # Login, Register
│   │   │   ├── student/       # StudentDashboard, Practice, MockTestExam, Performance, etc.
│   │   │   └── teacher/       # TeacherDashboard, CreateQuiz, QuizResults, etc.
│   │   ├── routes/            # ProtectedRoute role guards
│   │   ├── services/          # Axios API client configured with Interceptors
│   │   ├── App.jsx            # Main Router setup
│   │   ├── main.jsx           # Application entry point
│   │   └── index.css          # Tailwind & custom CSS rules
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend Express.js Server
│   ├── config/                # Database connection (db.js)
│   ├── controllers/           # REST API controllers
│   ├── middleware/            # Auth JWT, Role authorization, Error Handler
│   ├── models/                # Mongoose Models (User, Category, Topic, Concept, Question, MockTest, Quiz, Result)
│   ├── routes/                # Express API endpoint definitions
│   ├── seed/                  # Seeder script (seed.js) with demo data
│   ├── uploads/               # CSV upload storage
│   ├── .env                   # Environment configuration
│   ├── app.js                 # Express app initialization
│   └── package.json
└── README.md
```

---

## ⚡ Quick Setup & Installation Guide

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Server running locally on port `27017` or MongoDB Atlas URI.

### 1. Backend Setup (`server`)
```bash
# Navigate to server directory
cd server

# Verify dependencies are installed
npm install

# (Optional) Seed database with demo accounts, topics, questions & mock tests
npm run seed

# Start backend server
npm run dev
# Server will run on http://localhost:5000
```

### 2. Frontend Setup (`client`)
```bash
# Navigate to client directory
cd client

# Install dependencies if not already done
node --max-old-space-size=4096 "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" install

# Start Vite development server
npm run dev
# Client will run on http://localhost:5173
```

---

## 🔑 Pre-Seeded Demo Login Credentials

Run `npm run seed` inside the `server/` directory to generate these ready-to-use accounts:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@testora.com` | `Admin@123` | Full access to users, question bank, and tests |
| **Teacher** | `teacher@testora.com` | `Teacher@123` | Access to quiz creation and student analytics |
| **Student** | `rahul@testora.com` | `Student@123` | Student portal (B.Tech CSE, Year 3) |
| **Student** | `sneha@testora.com` | `Student@123` | Student portal (B.Tech IT, Year 4) |

---

## 📡 API Endpoint Summary

### Auth Endpoints (`/api/auth`)
- `POST /api/auth/register` — Register a new student account
- `POST /api/auth/login` — Login user & receive JWT token
- `GET /api/auth/me` — Fetch current logged-in user profile
- `PUT /api/auth/profile` — Update user profile information
- `PUT /api/auth/change-password` — Change account password

### Student & Test Endpoints
- `GET /api/categories` & `GET /api/topics` — Fetch categories and topics
- `GET /api/concepts/:topicId` — View concept study card for a topic
- `GET /api/questions/practice/:topicId` — Get practice questions
- `POST /api/questions/practice/submit` — Submit single practice answer
- `GET /api/mock-tests` & `GET /api/mock-tests/:id` — View mock test listings and details
- `POST /api/mock-tests/:id/start` — Begin a mock test session
- `POST /api/mock-tests/:id/submit` — Submit completed test responses
- `GET /api/performance` — Fetch performance analytics & weak topics

### Teacher & Admin Endpoints
- `GET /api/admin/stats` — System dashboard counters & stats
- `GET/PUT /api/admin/students` — View & toggle student status
- `POST/PUT /api/admin/teachers` — Create & manage teacher credentials
- `POST /api/questions` & `POST /api/questions/import` — Add single question or import CSV batch
- `POST /api/quizzes` — Create new teacher quiz
- `GET /api/quizzes/:id/results` — Fetch student scores for a specific quiz

---

## 📄 License
Academic Mini-Project for College Evaluation.
