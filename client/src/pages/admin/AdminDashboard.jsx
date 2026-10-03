import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  HiOutlineUsers, HiOutlineAcademicCap, HiOutlineQuestionMarkCircle,
  HiOutlineTag, HiOutlineClipboardList, HiOutlineChartBar,
} from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const stats = [
    { label: 'Total Students', value: data?.studentCount, icon: HiOutlineUsers, color: 'text-primary-400', bg: 'bg-primary-900/30 border-primary-800/40' },
    { label: 'Total Teachers', value: data?.teacherCount, icon: HiOutlineAcademicCap, color: 'text-emerald-400', bg: 'bg-emerald-900/30 border-emerald-800/40' },
    { label: 'Total Questions', value: data?.questionCount, icon: HiOutlineQuestionMarkCircle, color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-800/40' },
    { label: 'Topics', value: data?.topicCount, icon: HiOutlineTag, color: 'text-sky-400', bg: 'bg-sky-900/30 border-sky-800/40' },
    { label: 'Mock Tests', value: data?.mockTestCount, icon: HiOutlineClipboardList, color: 'text-violet-400', bg: 'bg-violet-900/30 border-violet-800/40' },
    { label: 'Test Attempts', value: data?.attemptCount, icon: HiOutlineChartBar, color: 'text-rose-400', bg: 'bg-rose-900/30 border-rose-800/40' },
  ];

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="bg-gradient-to-r from-amber-900/60 to-orange-900/40 border border-amber-800/40 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm">Platform overview and management center</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`card border ${bg} flex flex-col gap-2 p-4`}>
            <Icon className={`h-6 w-6 ${color}`} />
            <div className={`text-2xl font-bold ${color}`}>{value ?? 0}</div>
            <div className="text-xs text-slate-400 leading-tight">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent attempts */}
      {data?.recentAttempts?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-white mb-4">Recent Test Attempts</h2>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Test</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAttempts.map(a => (
                  <tr key={a._id}>
                    <td className="font-medium text-slate-200">
                      {a.userId ? `${a.userId.firstName} ${a.userId.lastName}` : 'N/A'}
                    </td>
                    <td className="text-slate-300">{a.testTitle}</td>
                    <td>{a.score}/{a.totalQuestions}</td>
                    <td>
                      <span className={`font-bold ${a.accuracy >= 80 ? 'text-emerald-400' : a.accuracy >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                        {a.accuracy}%
                      </span>
                    </td>
                    <td className="text-slate-500 text-xs">{new Date(a.submittedAt).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
