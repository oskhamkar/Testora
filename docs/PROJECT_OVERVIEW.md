# Testora — Project Overview

**What it is:** Testora is a web platform for aptitude test preparation used by three kinds of people — students who prepare and take tests, teachers who create and assign quizzes to their students, and admins who manage the platform's content and users. It runs as a React web app talking to a Node.js/Express API backed by MongoDB.

**How content is organized:** Everything test-related sits under a simple three-level structure:

```
Category (subject)  →  Topic  →  Question
e.g. Quantitative Aptitude → Percentages → "What is 20% of 150?"
```

Admins create Categories and Topics. Questions are then attached to a Topic (and therefore to a Category). Teachers don't manage this structure — they just pick a Category and a Topic when writing quiz questions.

**The two ways students get tested:**
| | Mock Test | Quiz |
|---|---|---|
| Created by | Admin | Teacher |
| Who can take it | Any student, once published | Only students it was assigned to |
| Question source | Picked from the existing question bank | Written fresh, inline, during quiz creation |
| Visibility | Shown to all students once published | Shown only within its start–end date window |

Both are scored the same way: **marks per question**, with an **optional negative mark** deducted for each wrong answer (skipped questions score zero, never negative). A student's result always shows marks obtained out of the maximum possible, not just "number correct."

**Who can do what (role-based access):**
- A logged-in session is a JWT token tied to one role — student, teacher, or admin — fixed at account creation and never changeable by the user.
- Every API endpoint checks both "are you logged in" and "is your role allowed here." Students, for example, can never fetch a question's correct answer through the API before they submit an attempt.
- If an admin deactivates an account, that account is locked out of every protected action immediately — even if they're already logged in with a valid token — and the next action in the browser sends them back to the login screen.

---

## 🎓 Student Portal

Everything under `/student/...`. A student's job here is: learn a topic, practice it, take tests, and track progress.

| Screen | What it's for |
|---|---|
| **Dashboard** | Landing page after login. Shows a stats snapshot (tests taken, questions solved, average accuracy), the student's weakest topics with a one-click link to practice them, any quizzes currently assigned and available, and the most recent test results. |
| **Topics** | Browse subjects (Quantitative Aptitude, Logical Reasoning, Verbal Ability, plus anything else admins have added) and drill into a subject to see its topics. |
| **Topic Detail** | One topic's page: description, how many study notes and how many questions exist for it, the study notes themselves (formulas, worked examples, key points), and a button to start practicing that topic. |
| **Practice** | Untimed, one-question-at-a-time practice for a chosen topic. Submit an answer and get instant feedback — correct/incorrect, the right answer, and an explanation — before moving to the next question. Ends with a session summary (correct/wrong/skipped, accuracy). |
| **Mock Tests** | Lists every mock test an admin has published, with question count and duration. Already-attempted tests show "View Result" instead of "Start," since each mock test can only be attempted once. |
| **Mock Test Exam** | The actual timed test screen — countdown timer, one question at a time with a navigator, answers are saved as you go, auto-submits when time runs out. Correct answers are never sent to the browser until after you submit. |
| **My Quizzes** | Quizzes a teacher has assigned, each tagged Upcoming / Available / Completed / Expired based on the quiz's scheduled date window. Only "Available" ones can be started. |
| **Quiz Exam** | Same timed exam experience as a Mock Test, just for a teacher-assigned quiz — scored using that quiz's configured marks and negative marking. |
| **Result Page** | After submitting any test: accuracy %, correct/wrong/skipped counts, time taken, marks obtained out of maximum possible marks, a per-topic accuracy breakdown, and a full question-by-question review (your answer vs. the correct one, with explanation) — only ever shown after submission. |
| **Performance** | The "how am I doing overall" page — accuracy trends across all tests taken, a chart of accuracy per topic, and topics automatically flagged as Weak / Needs Practice / Strong based on past attempts, each with a direct link into Practice mode. |
| **Test History** | A simple, filterable, paginated log of every test ever attempted (mock test or quiz), with a link back to each one's full result. |
| **Profile** | Edit name, mobile, college, course, and year; change password. |

---

## 👩‍🏫 Teacher Portal

Everything under `/teacher/...`. A teacher's job here is: write quizzes and see how their students did.

| Screen | What it's for |
|---|---|
| **Dashboard** | Landing page — quick stats (total quizzes, how many are published vs. still drafts) and a shortcut list of recent quizzes with a link straight to each one's results. |
| **Quiz Management** | Every quiz this teacher has created: question count, total marks (and negative-marking amount if enabled), duration, draft/published status, and the date window it's open for. Actions: view results, or delete (with a confirmation prompt). |
| **Create Quiz** | A guided 3-step quiz builder:<br>**1. Select Category** — pick the subject this quiz belongs to.<br>**2. Quiz Details** — title, description, how many questions, duration, marks per question, and an optional negative-marking amount, plus the start/end date window.<br>**3. Set Questions** — one form per question (as many as chosen in step 2), each needing a topic, the question text, four options, which one is correct, and an optional explanation.<br>Submitting creates all those questions fresh in the question bank, creates the quiz, and automatically assigns it to **every active student** — there's no manual student-picking step. |
| **Quiz Results** | For one quiz: how many students it was assigned to, how many have completed it, the class average accuracy, and a table of every student's score (marks obtained / max marks), accuracy, and completion status. |
| **Profile** | Edit name and area of specialization; change password. |

---

## 🛡️ Admin Portal

Everything under `/admin/...`. An admin's job here is: manage who's on the platform and what content exists.

| Screen | What it's for |
|---|---|
| **Dashboard** | Platform-wide numbers pulled live from the database: Total Students, Total Teachers, Total Topics, Total Questions (plus mock test and test-attempt counts), and a feed of the most recent completed test attempts across everyone. |
| **Students** | Every registered student — name, college, course, year, and status — with an Activate/Deactivate action. Deactivating a student immediately locks them out of the app, including any session they're already logged into. |
| **Teachers** | Every teacher account — name, mobile, specialization, and status — with Edit and Activate/Deactivate actions. This is also where new teacher accounts get created (there's no public "sign up as a teacher" page — only an admin can create one), by setting their name, email, mobile, specialization, and an initial password. |
| **Categories** | Create/edit/deactivate the top-level subjects (e.g. "Quantitative Aptitude"). These are exactly the categories teachers see when creating a quiz. |
| **Topics** | Create/edit/deactivate topics, each one filed under a category (e.g. "Percentages" under Quantitative Aptitude). |
| **Concepts** | Study-note content attached to a topic — free-text explanation, a list of formulas, worked examples, and key points. This is separate from questions; it's what students read on a Topic Detail page before practicing. |
| **Questions** | The master question bank: full create/edit/deactivate for every question (text, category, topic, four options, correct answer, optional explanation), searchable and filterable by category and topic. Also where bulk content management happens:<br>• **CSV import** of questions from a spreadsheet.<br>• **JSON import** using a documented format — either pasted in or uploaded as a `.json` file — which validates every question before importing anything, and refuses the whole batch if even one question is invalid or a duplicate.<br>• **CSV export**, either everything or just a filtered subset. |
| **Mock Tests** | Create/edit full-length mock tests: title, description, duration, marks per question, optional negative marking, and a question picker (filterable by category) to assemble the test. A publish/unpublish toggle controls whether students can see and attempt it. |

---

## How the pieces connect — a worked example

1. **Admin** creates the category "Quantitative Aptitude" and the topic "Percentages" under it.
2. **Admin** either writes individual questions on "Percentages" in the Question Bank, or bulk-imports 50 of them via CSV/JSON.
3. **Admin** picks 20 of those questions to assemble a published "Quantitative Aptitude Mock Test," with negative marking enabled.
4. Any **student** can now see and attempt that mock test, once, under its timer — never seeing correct answers until after submitting — and gets a marks-based result (accounting for the negative marking) on their Result page and in their history.
5. Separately, a **teacher** runs their own class quiz: picks "Quantitative Aptitude" as the category, sets 10 questions, writes each one fresh (text, options, correct answer) scoped to topics like "Percentages" or "Profit & Loss," and publishes it — which auto-assigns it to every active student.
6. The **teacher** later opens Quiz Results to see each student's score and class average; the **admin** sees that same activity reflected in the platform-wide dashboard counts and recent-attempts feed.

---

*This document reflects the application as of this writing. For exact API routes, environment setup, and a running log of recent backend/frontend changes, see the main [README.md](../README.md).*
