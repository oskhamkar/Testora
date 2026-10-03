import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineBan } from 'react-icons/hi';

const statusConfig = {
  available: { label: 'Available', cls: 'badge-success' },
  upcoming: { label: 'Upcoming', cls: 'badge-secondary' },
  completed: { label: 'Completed', cls: 'badge-primary' },
  expired: { label: 'Expired', cls: 'badge-danger' },
};

const MyQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/quizzes/my')
      .then(r => setQuizzes(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="section-title text-2xl">My Quizzes</h1>
          <p className="text-slate-400 text-sm mt-1">Quizzes assigned by your teacher</p>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState icon="📋" title="No quizzes assigned yet" description="Your teacher hasn't assigned any quizzes to you yet." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map(quiz => {
            const status = statusConfig[quiz.availabilityStatus] || statusConfig.upcoming;
            return (
              <div key={quiz._id} className="card flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-100">{quiz.title}</h3>
                  <span className={status.cls}>{status.label}</span>
                </div>

                <p className="text-slate-500 text-sm line-clamp-2">{quiz.description}</p>

                <div className="flex gap-4 text-sm text-slate-400">
                  <span>📋 {quiz.questionCount} Qs</span>
                  <span>⏱ {quiz.durationMinutes} min</span>
                  <span>👤 {quiz.createdBy?.firstName}</span>
                </div>

                <div className="text-xs text-slate-500">
                  <span>Available: {new Date(quiz.startDate).toLocaleDateString()} – {new Date(quiz.endDate).toLocaleDateString()}</span>
                </div>

                <div className="mt-auto">
                  {quiz.availabilityStatus === 'available' ? (
                    <Link to={`/student/quiz/${quiz._id}`} className="btn-primary w-full justify-center py-2.5">
                      Start Quiz
                    </Link>
                  ) : quiz.availabilityStatus === 'completed' ? (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm justify-center py-2">
                      <HiOutlineCheckCircle className="h-5 w-5" /> Completed
                    </div>
                  ) : quiz.availabilityStatus === 'expired' ? (
                    <div className="flex items-center gap-2 text-slate-500 text-sm justify-center py-2">
                      <HiOutlineBan className="h-5 w-5" /> Expired
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-400 text-sm justify-center py-2">
                      <HiOutlineClock className="h-5 w-5" /> Not Yet Available
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyQuizzes;
