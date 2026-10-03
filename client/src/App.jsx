import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import Topics from './pages/student/Topics';
import TopicDetail from './pages/student/TopicDetail';
import Practice from './pages/student/Practice';
import MockTests from './pages/student/MockTests';
import MockTestExam from './pages/student/MockTestExam';
import MyQuizzes from './pages/student/MyQuizzes';
import QuizExam from './pages/student/QuizExam';
import ResultPage from './pages/student/ResultPage';
import Performance from './pages/student/Performance';
import TestHistory from './pages/student/TestHistory';
import StudentProfile from './pages/student/StudentProfile';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherQuizzes from './pages/teacher/TeacherQuizzes';
import CreateQuiz from './pages/teacher/CreateQuiz';
import QuizResults from './pages/teacher/QuizResults';
import TeacherQuestionBank from './pages/teacher/TeacherQuestionBank';
import TeacherProfile from './pages/teacher/TeacherProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminTopics from './pages/admin/AdminTopics';
import AdminConcepts from './pages/admin/AdminConcepts';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminMockTests from './pages/admin/AdminMockTests';

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute roles={['student']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="topics" element={<Topics />} />
                    <Route path="topics/:id" element={<TopicDetail />} />
                    <Route path="practice" element={<Practice />} />
                    <Route path="mock-tests" element={<MockTests />} />
                    <Route path="mock-tests/:id" element={<MockTestExam />} />
                    <Route path="quizzes" element={<MyQuizzes />} />
                    <Route path="quizzes/:id" element={<QuizExam />} />
                    <Route path="results/:resultId" element={<ResultPage />} />
                    <Route path="performance" element={<Performance />} />
                    <Route path="history" element={<TestHistory />} />
                    <Route path="profile" element={<StudentProfile />} />
                    <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute roles={['teacher']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<TeacherDashboard />} />
                    <Route path="quizzes" element={<TeacherQuizzes />} />
                    <Route path="quizzes/create" element={<CreateQuiz />} />
                    <Route path="quizzes/:id/results" element={<QuizResults />} />
                    <Route path="questions" element={<TeacherQuestionBank />} />
                    <Route path="profile" element={<TeacherProfile />} />
                    <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="students" element={<AdminStudents />} />
                    <Route path="teachers" element={<AdminTeachers />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="topics" element={<AdminTopics />} />
                    <Route path="concepts" element={<AdminConcepts />} />
                    <Route path="questions" element={<AdminQuestions />} />
                    <Route path="mock-tests" element={<AdminMockTests />} />
                    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
