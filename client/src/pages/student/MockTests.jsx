import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { HiOutlineClipboardList, HiOutlineClock, HiOutlineLockClosed } from 'react-icons/hi';

const MockTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attempted, setAttempted] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const [testsRes, histRes] = await Promise.all([
          api.get('/mock-tests'),
          api.get('/performance/history?limit=100'),
        ]);
        setTests(testsRes.data.data);
        const done = {};
        histRes.data.data.forEach(a => {
          if (a.testType === 'mockTest') done[a.testId] = a;
        });
        setAttempted(done);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="section-title text-2xl">Mock Tests</h1>
          <p className="text-slate-400 text-sm mt-1">Simulate placement aptitude exams</p>
        </div>
      </div>

      {tests.length === 0 ? (
        <EmptyState icon="📋" title="No mock tests available" description="Published mock tests will appear here." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tests.map(test => {
            const attempt = attempted[test._id];
            return (
              <div key={test._id} className="card-hover flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-xl bg-primary-900/40 border border-primary-800/30 flex items-center justify-center">
                    <HiOutlineClipboardList className="h-6 w-6 text-primary-400" />
                  </div>
                  {attempt ? (
                    <div className="badge-success text-xs">
                      Completed: {attempt.score}/{attempt.totalQuestions}
                    </div>
                  ) : (
                    <span className="badge-primary">Available</span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-slate-100 text-lg">{test.title}</h3>
                  <p className="text-slate-500 text-sm mt-1 line-clamp-2">{test.description}</p>
                </div>

                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <HiOutlineClipboardList className="h-4 w-4" />
                    {test.questionIds?.length} Questions
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <HiOutlineClock className="h-4 w-4" />
                    {test.durationMinutes} Minutes
                  </div>
                </div>

                <div className="mt-auto">
                  {attempt ? (
                    <div className="flex gap-2">
                      <Link to={`/student/result/${attempt._id}`} className="btn-outline text-sm py-2 flex-1 justify-center">
                        View Result
                      </Link>
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm px-3 py-2">
                        <HiOutlineLockClosed className="h-4 w-4" />
                        Attempted
                      </div>
                    </div>
                  ) : (
                    <Link to={`/student/mock-test/${test._id}`} className="btn-primary w-full justify-center py-2.5">
                      Start Test
                    </Link>
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

export default MockTests;
