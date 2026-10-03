import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { HiOutlinePlusCircle, HiOutlineEye, HiOutlineTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';

const TeacherQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await api.get('/quizzes');
    setQuizzes(res.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz?')) return;
    await api.delete(`/quizzes/${id}`);
    toast.success('Quiz deleted');
    load();
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="section-title text-2xl">Quiz Management</h1>
          <p className="text-slate-400 text-sm mt-1">Create and manage your quizzes</p>
        </div>
        <Link to="/teacher/quizzes/create" className="btn-success">
          <HiOutlinePlusCircle className="h-5 w-5" /> Create Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState icon="📋" title="No quizzes yet" description="Create your first quiz to assess your students." action={<Link to="/teacher/quizzes/create" className="btn-success">Create Quiz</Link>} />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Quiz Title</th>
                <th>Questions</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Date Range</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map(q => (
                <tr key={q._id}>
                  <td className="font-medium text-slate-200">{q.title}</td>
                  <td>{q.questionIds?.length || 0}</td>
                  <td>{q.durationMinutes} min</td>
                  <td><span className={q.status === 'published' ? 'badge-success' : 'badge-secondary'}>{q.status}</span></td>
                  <td className="text-xs text-slate-500">
                    {q.startDate ? `${new Date(q.startDate).toLocaleDateString()} – ${new Date(q.endDate).toLocaleDateString()}` : '—'}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link to={`/teacher/quizzes/${q._id}/results`} className="text-primary-400 hover:text-primary-300 text-xs flex items-center gap-1">
                        <HiOutlineEye className="h-4 w-4" /> Results
                      </Link>
                      <button onClick={() => handleDelete(q._id)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherQuizzes;
