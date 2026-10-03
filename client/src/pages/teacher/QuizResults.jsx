import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { HiOutlineArrowLeft, HiOutlineChartBar } from 'react-icons/hi';

const QuizResults = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/quizzes/${id}/results`)
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!data) return <div className="text-center py-20 text-slate-400">Quiz not found</div>;

  const { quiz, results } = data;
  const completed = results.filter(r => r.attempt).length;
  const avgAcc = completed > 0 ? Math.round(results.filter(r => r.attempt).reduce((s, r) => s + r.attempt.accuracy, 0) / completed) : 0;

  return (
    <div className="space-y-6 animate-slide-up">
      <Link to="/teacher/quizzes" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
        <HiOutlineArrowLeft className="h-4 w-4" /> Back to Quizzes
      </Link>

      <div className="card">
        <h1 className="text-xl font-bold text-white">{quiz.title}</h1>
        <p className="text-slate-400 text-sm mt-1">{quiz.description}</p>
        <div className="flex gap-6 mt-3 text-sm">
          <span className="text-slate-400">{quiz.questionIds?.length} Questions</span>
          <span className="text-slate-400">{quiz.durationMinutes} min</span>
          <span className={quiz.status === 'published' ? 'badge-success' : 'badge-secondary'}>{quiz.status}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="text-2xl font-bold text-white">{results.length}</div>
          <div className="text-sm text-slate-400">Assigned</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-emerald-400">{completed}</div>
          <div className="text-sm text-slate-400">Completed</div>
        </div>
        <div className="stat-card">
          <div className="text-2xl font-bold text-primary-400">{avgAcc}%</div>
          <div className="text-sm text-slate-400">Avg Accuracy</div>
        </div>
      </div>

      {/* Results table */}
      <div className="card">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
          <HiOutlineChartBar className="h-5 w-5 text-primary-400" /> Student Results
        </h2>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Score</th>
                <th>Accuracy</th>
                <th>Correct</th>
                <th>Wrong</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map(({ student, attempt, assignmentStatus }) => (
                <tr key={student._id}>
                  <td>
                    <div>
                      <p className="font-medium text-slate-200">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-slate-500">{student.email}</p>
                    </div>
                  </td>
                  <td>{attempt ? `${attempt.score}/${quiz.questionIds?.length}` : '—'}</td>
                  <td>
                    {attempt ? (
                      <span className={`font-bold ${attempt.accuracy >= 80 ? 'text-emerald-400' : attempt.accuracy >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                        {attempt.accuracy}%
                      </span>
                    ) : '—'}
                  </td>
                  <td className="text-emerald-400">{attempt?.correct ?? '—'}</td>
                  <td className="text-red-400">{attempt?.wrong ?? '—'}</td>
                  <td>
                    <span className={
                      attempt ? 'badge-success' :
                      assignmentStatus === 'started' ? 'badge-warning' : 'badge-secondary'
                    }>
                      {attempt ? 'Completed' : assignmentStatus === 'started' ? 'In Progress' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
