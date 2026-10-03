import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { HiOutlineExclamationCircle, HiOutlineCheckCircle, HiOutlineFire } from 'react-icons/hi';

const statusColors = { weak: 'text-red-400', needs_practice: 'text-amber-400', strong: 'text-emerald-400', insufficient_data: 'text-slate-500' };
const statusLabels = { weak: 'Weak', needs_practice: 'Needs Practice', strong: 'Strong', insufficient_data: 'Not Enough Data' };
const statusBadge = { weak: 'badge-danger', needs_practice: 'badge-warning', strong: 'badge-success', insufficient_data: 'badge-secondary' };

const Performance = () => {
  const [overview, setOverview] = useState(null);
  const [topics, setTopics] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, tp, wt] = await Promise.all([
          api.get('/performance/overview'),
          api.get('/performance/topics'),
          api.get('/performance/weak-topics'),
        ]);
        setOverview(ov.data.data);
        setTopics(tp.data.data);
        setWeakTopics(wt.data.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const chartData = topics.slice(0, 8).map(t => ({
    name: t.topicName?.split(' ').slice(0, 2).join(' '),
    accuracy: t.accuracy,
    attempts: t.attempted,
  }));

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="section-title text-2xl">Performance Analysis</h1>
        <p className="text-slate-400 text-sm mt-1">Track your aptitude preparation progress</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tests Attempted', value: overview?.testsAttempted ?? 0, color: 'text-primary-400' },
          { label: 'Questions Attempted', value: overview?.questionsAttempted ?? 0, color: 'text-sky-400' },
          { label: 'Correct Answers', value: overview?.correctAnswers ?? 0, color: 'text-emerald-400' },
          { label: 'Average Accuracy', value: overview?.averageAccuracy ? `${overview.averageAccuracy}%` : '—', color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-sm text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      {topics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="card">
            <h2 className="font-bold text-white mb-4">Topic Accuracy (%)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }}
                  labelStyle={{ color: '#e2e8f0' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Bar dataKey="accuracy" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Topic list */}
          <div className="card">
            <h2 className="font-bold text-white mb-4">All Topic Performance</h2>
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {topics.map((topic) => (
                <div key={topic.topicId} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-300 truncate">{topic.topicName}</span>
                      <span className={`text-sm font-bold ml-2 ${statusColors[topic.status]}`}>{topic.accuracy}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${topic.accuracy >= 80 ? 'bg-emerald-500' : topic.accuracy >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${topic.accuracy}%` }}
                      />
                    </div>
                  </div>
                  <span className={`${statusBadge[topic.status]} flex-shrink-0 text-xs`}>{statusLabels[topic.status]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weak Topics */}
      {weakTopics.length > 0 ? (
        <div className="card">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <HiOutlineExclamationCircle className="h-5 w-5 text-amber-400" />
            Recommended Practice
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {weakTopics.map((topic) => (
              <div key={topic.topicId} className={`border rounded-xl p-4 ${topic.status === 'weak' ? 'border-red-800/40 bg-red-900/10' : 'border-amber-800/30 bg-amber-900/10'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-200">{topic.topicName}</p>
                    <p className="text-xs text-slate-500">{topic.categoryName}</p>
                  </div>
                  <span className={`${topic.status === 'weak' ? 'text-red-400' : 'text-amber-400'} font-bold text-lg`}>{topic.accuracy}%</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  {topic.status === 'weak'
                    ? '⚠️ You need significant improvement in this topic.'
                    : '📈 You are improving — keep practicing this topic.'}
                </p>
                <Link to={`/student/practice/${topic.topicId}`} className="btn-primary text-xs py-1.5 px-3">
                  Practice Now →
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : topics.length > 0 ? (
        <div className="card text-center py-8">
          <HiOutlineCheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="font-bold text-white">Excellent Performance!</h3>
          <p className="text-slate-400 text-sm mt-1">No weak topics detected. Keep it up!</p>
        </div>
      ) : (
        <EmptyState
          icon="📊"
          title="No performance data yet"
          description="Take some mock tests or quizzes to see your performance analysis here."
          action={<Link to="/student/mock-tests" className="btn-primary">Take a Mock Test</Link>}
        />
      )}
    </div>
  );
};

export default Performance;
