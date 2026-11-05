# Testora – Viva Preparation Pack

Group: Omkar, Harish, Mangesh · Project: Testora – Aptitude Preparation & Online Test System (MERN)

How to use: read Part 1 and 2 aloud once together, then each person learns their own module in Part 3, then drill Part 4 (questions). Part 5 lists the weak points an examiner may probe; answer them honestly.

---

## Part 1 – Introduction script (about 2 minutes)

**Omkar (opens):**
"Good morning sir/madam. We are Omkar, Harish and Mangesh, and our mini project is **Testora**, a web-based aptitude preparation and online test system. Students preparing for campus placements practise aptitude questions on scattered websites, while teachers and colleges have no simple way to set their own timed tests, assign them and see results. Testora puts learning, practice, assessment and analytics on one platform."

**Harish:**
"Testora has three roles. A **student** reads topic notes, practises questions with instant feedback, takes timed mock tests and teacher quizzes, and sees a result with marks, a topic-wise breakdown and weak-topic analysis. A **teacher** creates a quiz through a three-step wizard and sees the class results. An **admin** manages students, teachers, categories, topics, concepts and the question bank, imports questions from JSON, exports them to CSV, and creates mock tests."

**Mangesh:**
"We built it on the **MERN stack**: React 18 with Vite, Tailwind and Recharts on the frontend; Node.js with Express 5 on the backend; MongoDB Atlas with Mongoose as the database. Security is handled with JWT authentication, bcrypt password hashing, role-based access control and server-side validation. Evaluation happens on the server, and correct answers are never sent to the browser before a test is submitted. We verified the system with 41 API test cases, all of which passed, and a browser walkthrough of all three roles."

**Omkar (closes):**
"Now we will show a short demonstration and then each of us will explain our part."

---

## Part 2 – Demo script (about 4 minutes, in this order)

1. **Login as Admin** (`admin@testora.com` / `Admin@123`): show dashboard counts → Categories/Topics → Questions (show Import JSON dialog and Export CSV) → Mock Tests (create with marks and negative marking, publish).
2. **Login as Teacher** (`teacher@testora.com` / `Teacher@123`): Create Quiz – step 1 category, step 2 details, step 3 questions → quiz appears in Quiz Management.
3. **Login as Student** (`rahul@testora.com` / `Student@123`): Dashboard → Topics → Topic detail (notes) → Practice (instant feedback) → Mock Tests → Start → submit → Result page (marks, topic breakdown, answer review) → Performance (weak/strong topics).
4. Back to **Teacher → Quiz Results** and **Admin → Students → Deactivate** to show the lock-out.

Before the viva: run `npm run seed` in `server`, start server (`npm run dev`) and client (`npm run dev`), and do one full rehearsal. Do not rely on a mock test you have already attempted, because each mock test can be attempted only once. Use a second student account or re-seed.

---

## Part 3 – Who did what

The git history cannot tell us who wrote which part, so **this split is a draft. Edit it so it matches what each of you actually did**; the examiner will ask each person about their own part.

| Member | Contribution (draft) |
|---|---|
| **Omkar** | Backend foundation and security: Express app structure, Mongoose models, JWT login/registration, `protect` and `authorize` middleware, validators, error handler, JSON import and CSV export, scoring with negative marking, seed script, database design (ER diagram). |
| **Harish** | Student portal frontend: dashboard, topics and topic detail, practice mode, mock-test exam screen with timer, result page, performance charts (Recharts), test history, profile; Axios setup and route guard. |
| **Mangesh** | Admin and teacher portals: admin dashboard, student/teacher management, categories, topics, concepts, question bank, mock-test builder; teacher dashboard, three-step Create Quiz wizard, quiz results; testing and project report/documentation. |

Everyone should be able to explain the overall architecture (Part 4, section A) and the scoring formula.

---

## Part 4 – Likely questions and answers

### A. Overview and design

**Q1. What is the problem and what is your solution?**
Aptitude practice is scattered across static websites, and teachers cannot easily run their own timed tests and see results. Testora provides practice, timed tests, automatic evaluation and performance analytics for students, with role-based portals for teachers and admins.

**Q2. Who are the users and what can each do?**
Student: learn, practise, take mock tests and quizzes, view results and performance. Teacher: create quizzes (assigned to all active students) and view quiz results. Admin: manage users and content, import/export questions, create mock tests.

**Q3. Why the MERN stack?**
One language (JavaScript) on client and server; JSON flows end to end; React components are reusable across the three portals; MongoDB documents suit questions with embedded options and attempts with embedded answers; large community and free tools.

**Q4. Explain the architecture.**
Three tiers. React single-page application (presentation) → Express REST API with middleware and controllers (application) → MongoDB Atlas through Mongoose (data). The client calls `/api/...` using Axios; in development Vite proxies `/api` to port 5000.

**Q5. What is the content hierarchy?**
Category → Topic → Question. Concepts (study notes) belong to a topic and are kept separate from questions.

**Q6. Difference between a Mock Test and a Quiz?**
Mock test: created by admin from existing questions, visible to all students once published, one attempt per student. Quiz: created by a teacher with questions written during creation, assigned to students, available only inside its start–end date window.

**Q7. What are the main collections?**
User, Category, Topic, Concept, Question, MockTest, TeacherQuiz, QuizAssignment, TestAttempt (nine collections, shown in the ER diagram in Chapter 3).

**Q8. Why MongoDB instead of MySQL?**
Questions have a variable embedded structure (options array), attempts embed answer and topic-performance arrays, and the schema changed during development; documents avoid many joins. We still model relationships with ObjectId references and enforce them in code. A relational database would also work.

**Q9. What is an ER diagram and what does yours show?**
It shows entities, their attributes and the relationships between them. In ours, a category has many topics, a topic has many concepts and questions, mock tests and quizzes include many questions (many-to-many), a quiz has many assignments, and a user has many attempts.

### B. Authentication and security

**Q10. How does login work?**
The server finds the user by e-mail, compares the password with the stored bcrypt hash, and returns a JWT whose payload holds the user id. The client stores the token and the Axios interceptor sends it in the `Authorization: Bearer` header on every request.

**Q11. How are passwords stored?**
Only as bcrypt hashes (10 salt rounds). Plain passwords are never stored or returned.

**Q12. What is JWT and how long does it live?**
JSON Web Token: a signed token (header, payload, signature) the server can verify without a session table. Ours expires in 7 days by default (`JWT_EXPIRE`) and is signed with `JWT_SECRET` from `.env`.

**Q13. How is role-based access enforced?**
Two middleware layers. `protect` verifies the token and reloads the user from the database; `authorize('admin')` etc. checks the role. The frontend `ProtectedRoute` only hides screens for usability; the real enforcement is on the server.

**Q14. Why reload the user on every request?**
So a deactivated account is blocked on its very next request even if its token has not expired.

**Q15. Can someone register as admin by changing the request?**
No. The register controller ignores any role in the body and always stores `student`. Teachers are created only by an admin.

**Q16. How do you stop students seeing correct answers?**
Question endpoints for students omit `correctAnswer` and `explanation`; `GET /api/questions` is restricted to admin/teacher; the correct answer is returned only after submission. We tested this (TC29, TC30).

**Q17. What other security measures exist?**
`helmet` security headers, CORS restricted to `CLIENT_URL`, `express-validator` on inputs, file upload limits (2 MB JSON, `.json` only) with Multer, centralised error handler, soft deletes, and secrets kept in `.env`.

**Q18. What is XSS / SQL injection and are you exposed?**
XSS: injecting script into a page; React escapes output by default. SQL injection: not applicable to MongoDB in the same form, but NoSQL injection is reduced by validating input types with express-validator and Mongoose schemas.

**Q19. Where is the token stored and is that safe?**
In `localStorage`. It is simple but readable by injected scripts if an XSS flaw existed; httpOnly cookies are safer. This is listed as a possible improvement.

### C. Core logic

**Q20. How is the score calculated?**
`score = correct × marksPerQuestion − wrong × negativeMarksPerQuestion`; skipped questions give 0. `maxMarks = number of questions × marksPerQuestion`. Both are stored on the attempt. Evaluation is done on the server so the client cannot tamper with it.
Example from our tests: 15 questions, 2 marks, 0.5 negative; 11 correct, 3 wrong, 1 skipped → 22 − 1.5 = 20.5 out of 30.

**Q21. How are weak topics identified?**
Each attempt stores per-topic results. For each topic we sum all attempts; a topic needs at least 5 attempted questions. Accuracy below 60% is Weak, up to 80% is Needs Practice, above 80% is Strong; fewer than 5 attempts shows "Not Enough Data".

**Q22. How does the timer work and what if time ends?**
The exam screen counts down from the test duration and auto-submits when it reaches zero; the time taken is stored with the attempt.

**Q23. What stops a student attempting a mock test twice?**
`startMockTest` checks for an existing completed attempt for that user and test and rejects it; the list shows "View Result".

**Q24. How does a teacher's quiz reach students?**
On creation (`assignAll`) a QuizAssignment document is created for every active student. The student sees it under My Quizzes with status Upcoming / Available / Completed / Expired by date window.

**Q25. How does JSON import work?**
Admin uploads a `.json` file (max 2 MB) or pastes JSON, up to 500 questions. The server validates every item first (text, four options, correct answer A–D, existing category and topic that belongs together) and checks duplicates. It is **all-or-nothing**: if any item fails, nothing is saved and a list of errors is returned; otherwise `insertMany` saves them in one go.

**Q26. How does CSV export handle commas and quotes?**
Values containing commas, quotes or line breaks are wrapped in double quotes and embedded quotes are doubled (RFC 4180).

**Q27. What is a soft delete and why?**
Records get `isActive: false` instead of being removed, so old attempts and results that reference them still work and nothing is lost by accident.

**Q28. How many questions can a quiz have and how is it validated?**
1 to 50 questions; the validator checks title, duration, marks, dates and each question's topic, text, four options and correct answer before anything is saved.

### D. Frontend

**Q29. What is React and what are hooks?**
A library for building UIs from components. Hooks such as `useState`, `useEffect`, `useContext` give function components state, side effects and shared context; we use them for auth state, data loading and the exam timer.

**Q30. How do you handle routing and protected pages?**
React Router v6 with a `ProtectedRoute` that checks login and role and redirects to login or the correct dashboard.

**Q31. How does the frontend talk to the backend?**
Through one Axios instance with a request interceptor that adds the token and a response interceptor that logs the user out on a 401.

**Q32. How do you show charts and notifications?**
Recharts for the performance charts; react-hot-toast for success/error messages; a shared `ConfirmDialog` for delete/deactivate confirmations.

**Q33. Is the UI responsive?**
Yes, Tailwind CSS with a collapsing sidebar on small screens; we checked a 390 × 844 viewport.

### E. Backend and database

**Q34. What is middleware in Express?**
A function that sees the request before the controller. We chain helmet → cors → JSON parser → `protect` → `authorize` → validators → controller → error handler.

**Q35. What is Mongoose and why use it?**
An ODM that gives MongoDB schemas, validation, defaults, indexes and `populate` for references.

**Q36. What REST principles do you follow?**
Resources as URLs (`/api/questions`), HTTP verbs for actions (GET, POST, PUT, DELETE), JSON responses `{ success, data }` and proper status codes (400, 401, 403, 404, 500).

**Q37. How are errors handled?**
A central error middleware converts Mongoose validation errors, duplicate-key errors and Multer errors into clean 400 responses; unexpected errors return 500 without leaking details.

**Q38. Why Express 5 and Vite?**
Express 5 handles async errors in routes and is the current version; Vite gives fast development builds and an `/api` proxy.

### F. Testing and results

**Q39. How did you test?**
41 API test cases (valid and invalid inputs for every role) run with a script on a separate demo database – all 41 passed – plus a browser walkthrough of the three portals, security checks and a production build with `vite build`. We did not write an automated unit-test suite.

**Q40. Give an example of a bug you found and fixed.**
(1) Students could call `GET /api/questions` and see correct answers – fixed by role restriction. (2) Negative marking was set but not applied to scores – fixed with weighted scoring and `maxMarks`. (3) "Start Test" buttons went to unregistered routes and redirected to the dashboard – fixed the links. (4) A strict validator broke the publish toggle – split into create and update validators.

### G. Limitations and future scope

**Q41. What are the limitations?**
If a student refreshes the page during a mock test, the attempt cannot be resumed and the timer is lost; no PDF export; no randomised question order; no proctoring; no automated regression tests; deployment is local (not hosted); teachers' quizzes go to all active students (no selection of individual students).

**Q42. What would you add next?**
Resume interrupted tests, PDF export, question and option shuffling, selecting specific students/batches for a quiz, email notifications, httpOnly cookies, automated tests and CI, and hosting on a cloud service.

**Q43. How would you scale it?**
Add database indexes where queries need them, keep pagination on lists, caching of read-only data, stateless API instances behind a load balancer, and a CDN for the frontend build.

### H. Personal and process

**Q44. What was the hardest part?**
Be honest and specific, e.g. scoring with negative marking across mock tests and quizzes, the all-or-nothing import validation, or keeping role security consistent between frontend and backend.

**Q45. How did you divide the work and collaborate?**
Use Part 3; mention Git/GitHub for version control and that features were integrated and tested together.

**Q46. What did you learn?**
Full-stack integration, REST API design, authentication and authorisation, data modelling in MongoDB, validation, and testing.

---

## Part 5 – Tricky points: answer honestly

- **"Is your mock test really secure from cheating?"** No proctoring; it prevents answer leakage and double attempts but cannot detect tab switching or impersonation.
- **"Does the timer survive a refresh?"** No – known limitation, documented in Section 5.5 of the report.
- **"Why no unit tests?"** Time; we tested through an API script and browser walkthrough, and list automated tests as future work.
- **"Why is JWT in localStorage?"** Simplicity for the project; httpOnly cookies are the more secure option.
- **"Whose code is this?"** Be ready to open and explain your own module's files: auth middleware and controllers (`server/middleware/auth.js`, `server/controllers`), student pages (`client/src/pages/student`), admin/teacher pages (`client/src/pages/admin`, `teacher`).
- If you do not know an answer, say what you do know about it and that you would check the documentation; do not invent.

## Quick facts to remember

- Stack: React 18, Vite, Tailwind, Recharts, Axios · Node.js, Express 5 · MongoDB Atlas, Mongoose 8 · JWT, bcryptjs, express-validator, Multer, helmet, cors.
- Seed data: 3 categories, 22 topics, 5 concepts, 58 questions, 5 mock tests, 1 teacher quiz.
- Tests: 41 / 41 passed. Report: 50 pages, 6 chapters.
- Limits: import ≤ 500 questions and ≤ 2 MB; quiz ≤ 50 questions; token 7 days; bcrypt 10 rounds.
- Weak < 60 %, Needs Practice ≤ 80 %, Strong > 80 % (minimum 5 attempted questions).
