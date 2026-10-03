import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const TestHistory = () => {
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (p = 1, tf = filter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 10 });
      if (tf) params.set('testType', tf);
      const res = await api.get(`/performance/history?${params}`);
      setHistory(res.data.data);
      setTotal(res.data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleFilter = (f) => {
    setFilter(f);
    setPage(1);
    load(1, f);
  };

  if (loading && history.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header flex-wrap gap-3">
        <div>
          <h1 className="section-title text-2xl">Test History</h1>
          <p className="text-slate-400 text-sm mt-1">All your previous test attempts</p>
        </div>
        <div className="flex gap-2">
          {['', 'mockTest', 'teacherQuiz'].map(f => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
            >
              {f === '' ? 'All' : f === 'mockTest' ? 'Mock Tests' : 'Quizzes'}
            </button>
          ))}
        </div>
      </div>

      {history.length === 0 ? (
        <EmptyState icon="📋" title="No test history" description="You haven't taken any tests yet. Start with a mock test!" action={<Link to="/student/mock-tests" className="btn-primary">Browse Mock Tests</Link>} />
      ) : (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Test Name</th>
                  <th>Type</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {history.map(a => (
                  <tr key={a._id}>
                    <td className="font-medium text-slate-200">{a.testTitle}</td>
                    <td>
                      <span className={a.testType === 'mockTest' ? 'badge-primary' : 'badge-success'}>
                        {a.testType === 'mockTest' ? 'Mock Test' : 'Quiz'}
                      </span>
                    </td>
                    <td className="font-semibold">{a.score}/{a.totalQuestions}</td>
                    <td>
                      <span className={`font-bold ${a.accuracy >= 80 ? 'text-emerald-400' : a.accuracy >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                        {a.accuracy}%
                      </span>
                    </td>
                    <td className="text-slate-500">{new Date(a.submittedAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <Link to={`/student/result/${a._id}`} className="text-primary-400 hover:text-primary-300 text-sm">
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 10 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Showing {history.length} of {total}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => { setPage(p => p - 1); load(page - 1); }} className="btn-outline py-1.5 px-3 text-xs disabled:opacity-40">Prev</button>
                <button disabled={history.length < 10} onClick={() => { setPage(p => p + 1); load(page + 1); }} className="btn-outline py-1.5 px-3 text-xs disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TestHistory;
