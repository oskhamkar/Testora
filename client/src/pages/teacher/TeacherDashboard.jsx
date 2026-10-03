import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { HiOutlineClipboardList, HiOutlineUserGroup, HiOutlinePlusCircle, HiOutlineChartBar, HiOutlineQuestionMarkCircle } from 'react-icons/hi';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/quizzes')
      .then(r => setQuizzes(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const total = quizzes.length;
  const published = quizzes.filter(q => q.status === 'published').length;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-emerald-900/60 to-teal-900/40 border border-emerald-800/40 rounded-2xl p-6">
        <p className="text-emerald-300 text-sm mb-1">Teacher Portal 👋</p>
        <h1 className="text-2xl font-bold text-white">Welcome, {user?.firstName}!</h1>
        <p className="text-slate-400 mt-1 text-sm">Create quizzes, assess students, and track performance.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/teacher/quizzes/create" className="btn-success text-sm py-2">
            <HiOutlinePlusCircle className="h-4 w-4" /> Create Quiz
          </Link>
          <Link to="/teacher/questions" className="btn-outline text-sm py-2">
            <HiOutlineQuestionMarkCircle className="h-4 w-4" /> Question Bank
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Quizzes', value: total, icon: HiOutlineClipboardList, color: 'text-primary-400' },
          { label: 'Published', value: published, icon: HiOutlineChartBar, color: 'text-emerald-400' },
          { label: 'Drafts', value: total - published, icon: HiOutlineClipboardList, color: 'text-amber-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <Icon className={`h-6 w-6 ${color} mb-1`} />
            <div className={`text-2xl font-bold text-white`}>{value}</div>
            <div className="text-sm text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent quizzes */}
      {quizzes.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title text-base">Your Quizzes</h2>
            <Link to="/teacher/quizzes" className="text-primary-400 hover:text-primary-300 text-sm">View all →</Link>
          </div>
          <div className="space-y-3">
            {quizzes.slice(0, 5).map(q => (
              <div key={q._id} className="flex items-center justify-between bg-slate-800/50 rounded-xl p-3">
                <div>
                  <p className="text-sm font-medium text-slate-200">{q.title}</p>
                  <p className="text-xs text-slate-500">{q.questionIds?.length || 0} Qs • {q.durationMinutes} min</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={q.status === 'published' ? 'badge-success' : 'badge-secondary'}>{q.status}</span>
                  <Link to={`/teacher/quizzes/${q._id}/results`} className="text-primary-400 hover:text-primary-300 text-xs">Results →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
