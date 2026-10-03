import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlineTrendingUp,
  HiOutlineBookOpen, HiOutlineLightningBolt, HiOutlineExclamationCircle,
  HiOutlineArrowRight, HiOutlineClock,
} from 'react-icons/hi';

const StatCard = ({ icon: Icon, label, value, color = 'text-primary-400' }) => (
  <div className="stat-card">
    <div className={`${color} mb-1`}><Icon className="h-6 w-6" /></div>
    <div className="text-2xl font-bold text-white">{value ?? '—'}</div>
    <div className="text-sm text-slate-400">{label}</div>
  </div>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [weakTopics, setWeakTopics] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, wt, qz, hist] = await Promise.all([
          api.get('/performance/overview'),
          api.get('/performance/weak-topics'),
          api.get('/quizzes/my'),
          api.get('/performance/history?limit=3'),
        ]);
        setOverview(ov.data.data);
        setWeakTopics(wt.data.data.slice(0, 3));
        setQuizzes(qz.data.data.filter(q => q.availabilityStatus === 'available').slice(0, 3));
        setHistory(hist.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-900/60 to-indigo-900/40 border border-primary-800/40 rounded-2xl p-6">
        <p className="text-primary-300 text-sm mb-1">{greeting} 👋</p>
        <h1 className="text-2xl font-bold text-white">{user?.firstName} {user?.lastName}</h1>
        <p className="text-slate-400 mt-1 text-sm">Continue your aptitude preparation — keep up the great work!</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/student/mock-tests" className="btn-primary text-sm py-2">
            <HiOutlineClipboardList className="h-4 w-4" /> Take Mock Test
          </Link>
          <Link to="/student/topics" className="btn-outline text-sm py-2">
            <HiOutlineBookOpen className="h-4 w-4" /> Browse Topics
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="section-title mb-4">Your Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={HiOutlineClipboardList} label="Tests Attempted" value={overview?.testsAttempted ?? 0} color="text-primary-400" />
          <StatCard icon={HiOutlineCheckCircle} label="Questions Solved" value={overview?.questionsAttempted ?? 0} color="text-emerald-400" />
          <StatCard icon={HiOutlineTrendingUp} label="Avg Accuracy" value={overview?.averageAccuracy ? `${overview.averageAccuracy}%` : '—'} color="text-amber-400" />
          <StatCard icon={HiOutlineBookOpen} label="Correct Answers" value={overview?.correctAnswers ?? 0} color="text-sky-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weak Topics */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2 text-base">
              <HiOutlineExclamationCircle className="h-5 w-5 text-amber-400" />
              Topics to Improve
            </h2>
            <Link to="/student/performance" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
              View all <HiOutlineArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {weakTopics.length === 0 ? (
            <div className="text-center py-8">
              <HiOutlineLightningBolt className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Great job! No weak topics found yet.</p>
              <p className="text-slate-500 text-xs mt-1">Take more tests to see your analysis.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {weakTopics.map((topic) => (
                <div key={topic.topicId} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{topic.topicName}</p>
                    <p className="text-xs text-slate-500">{topic.categoryName}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${topic.accuracy < 60 ? 'text-red-400' : 'text-amber-400'}`}>
                      {topic.accuracy}%
                    </p>
                    <Link
                      to={`/student/practice?topic=${topic.topicId}`}
                      className="text-xs text-primary-400 hover:text-primary-300"
                    >
                      Practice Now →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Quizzes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title flex items-center gap-2 text-base">
              <HiOutlineClock className="h-5 w-5 text-sky-400" />
              Pending Quizzes
            </h2>
            <Link to="/student/quizzes" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
              View all <HiOutlineArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {quizzes.length === 0 ? (
            <div className="text-center py-8">
              <HiOutlineCheckCircle className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No pending quizzes</p>
              <p className="text-slate-500 text-xs mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <div key={quiz._id} className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{quiz.title}</p>
                    <p className="text-xs text-slate-500">By {quiz.createdBy?.firstName} • {quiz.questionCount} Qs • {quiz.durationMinutes}min</p>
                  </div>
                  <Link to="/student/quizzes" className="btn-primary text-xs py-1.5 px-3">
                    Start
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent History */}
      {history.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title text-base">Recent Tests</h2>
            <Link to="/student/history" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
              Full History <HiOutlineArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {history.map((attempt) => (
              <Link key={attempt._id} to={`/student/result/${attempt._id}`} className="flex items-center justify-between bg-slate-800/40 hover:bg-slate-800 rounded-lg p-3 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-200">{attempt.testTitle}</p>
                  <p className="text-xs text-slate-500 capitalize">{attempt.testType === 'mockTest' ? 'Mock Test' : 'Quiz'} • {new Date(attempt.submittedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{attempt.score}/{attempt.totalQuestions}</p>
                  <p className={`text-xs ${attempt.accuracy >= 80 ? 'text-emerald-400' : attempt.accuracy >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                    {attempt.accuracy}%
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
