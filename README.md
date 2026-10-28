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
- **Quiz Management**: Create, publish, and delete custom quizzes.
- **Guided Quiz Creator**: Category → Quiz Details → Set Questions workflow. The teacher sets a question count, marks per question, and optional negative marking, then fills in that many question forms (text, 4 options, correct answer, optional explanation) — each one is saved as a new question in the bank. The quiz is automatically assigned to all active students; there is no manual student-selection step.
- **Class Results & Analytics**: View individual student scores (marks obtained / max marks), accuracy, submission timestamps, and overall class statistics.

### 🛡️ **Admin Portal**
- **System Overview**: Total Students, Total Teachers, Total Topics, and Total Questions (in that order), plus mock test and attempt counts — all computed live from the database.
- **User Management**: Activate/deactivate student and faculty accounts; create and manage teacher credentials, including specialization.
- **Category & Topic Management**: Full CRUD controls for subjects and sub-topics, created by the admin and immediately available in teacher quiz creation.
- **Concept Editor**: Add and edit rich study cards with formulas, sample problems, and key rules (separate from the question bank — these are "learn" content, not test questions).
- **Global Question Bank**: Add, edit, and deactivate questions with category/topic selection and full-text search, plus:
  - **CSV import** (documented column format) and **CSV export** (full or filtered by category/topic/search).
  - **JSON import** (documented format, either pasted or as an uploaded `.json` file up to 2MB / 500 questions) — validates every question's fields, options, correct answer, and category/topic references; a batch with any invalid or duplicate question is rejected in full (no partial imports).
- **Mock Test Builder**: Create full-length mock tests with duration, marks per question, optional negative marking, and a question picker.

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
│   │   │   └── teacher/       # TeacherDashboard, CreateQuiz, QuizResults
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
│   ├── models/                # Mongoose Models (User, Category, Topic, Concept, Question, MockTest, TeacherQuiz, QuizAssignment, TestAttempt)
│   ├── routes/                # Express API endpoint definitions
│   ├── seed/                  # Seeder script (seed.js) with demo data
│   ├── uploads/               # CSV/JSON import storage (gitignored; created automatically on server startup)
│   ├── .env                   # Environment configuration
│   ├── app.js                 # Express app initialization
│   └── package.json
└── README.md
```

---

## ⚡ Quick Setup & Installation Guide

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Server running locally on port `27017`, or a MongoDB Atlas URI.

### Environment variables (`server/.env`)
Copy `server/.env.example` to `server/.env` and fill in real values — never commit `.env` itself (it's gitignored). Required variables:

| Variable | Purpose |
| :--- | :--- |
| `PORT` | Port the Express server listens on (default `5000`) |
| `MONGODB_URI` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | Secret used to sign/verify JWTs — use a long random value, never reuse across environments |
| `JWT_EXPIRE` | Token lifetime, e.g. `7d` |
| `CLIENT_URL` | Frontend origin allowed by CORS, e.g. `http://localhost:5173` |
| `NODE_ENV` | `development` or `production` |

### 1. Backend Setup (`server`)
```bash
cd server
npm install

# (Optional) Seed database with demo accounts, categories, topics, questions & mock tests
# WARNING: this clears all existing data in the target database first.
npm run seed

npm run dev
# Server will run on http://localhost:5000 (or PORT from .env)
```
On startup the server creates `server/uploads/` automatically if it doesn't exist — this is where CSV/JSON import files are temporarily written before being parsed and deleted.

### 2. Frontend Setup (`client`)
```bash
cd client
npm install

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
- `GET /api/admin/dashboard` — Dashboard counters (students, teachers, topics, questions, mock tests, attempts)
- `GET /api/admin/students` & `PUT /api/admin/students/:id/toggle` — View & activate/deactivate students
- `GET/POST/PUT /api/admin/teachers` & `PUT /api/admin/teachers/:id/toggle` — Create, edit, activate/deactivate teachers (incl. specialization)
- `GET /api/questions`, `POST /api/questions`, `PUT/DELETE /api/questions/:id` — Question CRUD (admin/teacher only — never exposed to students directly)
- `POST /api/questions/import` — CSV import (partial imports allowed, row-level errors reported)
- `POST /api/questions/import-json` — JSON import, pasted body or uploaded `.json` file (max 2MB / 500 questions); all-or-nothing, with duplicate detection
- `GET /api/questions/export` — CSV export, full or filtered by `categoryId`/`topicId`/`search`
- `POST /api/quizzes` — Create a quiz with inline question creation (category, details, dynamically generated questions)
- `POST /api/quizzes/:id/assign` — Assign a quiz to all active students (`assignAll: true`)
- `GET /api/quizzes/:id/results` — Fetch student scores (marks obtained / max marks) for a specific quiz
- `POST/PUT/DELETE /api/mock-tests` — Mock test CRUD, including `marksPerQuestion`/`negativeMarksPerQuestion`

---

## 🔄 Recent Changes

- Teacher quiz creation reworked into **Category → Quiz Details → Set Questions**: question count drives dynamically generated question forms (no more picking from the existing bank), with marks-per-question and optional negative marking, and automatic assignment to all active students.
- Added `specialization` to the User model and surfaced it in teacher management and the teacher profile page (this replaced a `department` field that was referenced in the UI but never existed on the schema — it silently did nothing before).
- `AdminQuestions` and `AdminMockTests` admin pages were rebuilt — they previously used field names (`questionText`, `category`, `correctOption`, `difficulty`, `totalMarks`, …) that didn't match the real `Question`/`MockTest` schemas and were non-functional.
- Added documented JSON question import (paste or `.json` file upload, all-or-nothing validation, duplicate detection) and CSV export (full or filtered).
- **Scoring now accounts for marks per question and negative marking** on both quizzes and mock tests (`TestAttempt.score` is the weighted marks obtained, `TestAttempt.maxMarks` is the total possible marks) — previously `score` was just a raw count of correct answers, so negative marking had no effect even when configured.
- **Security fix**: `GET /api/questions` and `GET /api/questions/:id` were reachable by any authenticated role, including students, and returned `correctAnswer`/`explanation` in full. They are now restricted to admin/teacher. The one legitimate student-facing caller (`TopicDetail`, which only needed a question *count*) was switched to use the count already returned by `GET /api/topics/:id` — this also fixed a pre-existing bug where that page read the wrong field and rendered a blank topic name/category.
- Removed the standalone teacher "Question Bank" browser page/route/nav entry — it only existed to support picking questions into a quiz, which the new quiz-creation flow no longer does. The admin question bank (with CSV/JSON import, export, full CRUD) is unaffected.
- Backend validation (`express-validator`) added across auth, quiz, question, category, topic, teacher, and mock-test routes, including a max of 50 questions per quiz and 100 per mock test.
- Native `window.confirm()` calls replaced with a shared `ConfirmDialog` component across admin/teacher pages.
- Fixed a deployment gap where `server/uploads/` (used by CSV/JSON import) didn't exist on a fresh checkout, since it's gitignored — the server now creates it on startup.

## ⚠️ Known Limitations

- **No automated test suite or lint config** exists in this repo. Verification for this round of changes was done with live API calls against a running server and `vite build` for the frontend, not an automated test run.
- **PDF export was explicitly descoped** in favor of CSV export only (by product decision, not a technical blocker).
- **No teacher hard-delete**: only soft-deactivate exists for teacher accounts, by design, so historical quizzes/questions (`createdBy` references) are always preserved.
- **Admin Edit/Deactivate actions on the Teacher table were kept as-is** — whether either should be removed was raised but left unresolved; no functional change was made there beyond adding the specialization field.
- **Responsive layout and confirmation dialogs were verified by code review and a production build, not by manual testing in a real browser** (no browser available in this environment) — the existing Tailwind responsive patterns were followed consistently, but visual QA on actual devices is still recommended.
- A small number of completed `TestAttempt` records from this round's live functional testing remain in the database (titled "Functional Scoring Quiz" / "Functional Scoring Test"); there is no delete endpoint for attempts (by design, to preserve history), so they were left in place rather than removed via direct database access.

---

## 📄 License
Academic Mini-Project for College Evaluation.
