import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { HiOutlineSearch } from 'react-icons/hi';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (s = search) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 20 });
    if (s) params.set('search', s);
    const res = await api.get(`/admin/students?${params}`);
    setStudents(res.data.data);
    setTotal(res.data.total);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (id) => {
    await api.put(`/admin/students/${id}/toggle`);
    toast.success('Student status updated');
    load();
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="section-title text-2xl">Students</h1>
          <p className="text-slate-400 text-sm mt-1">{total} registered students</p>
        </div>
        <div className="flex gap-2">
          <input className="input w-48" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} />
          <button onClick={() => load()} className="btn-secondary px-3"><HiOutlineSearch className="h-5 w-5" /></button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : students.length === 0 ? (
        <EmptyState icon="👥" title="No students found" />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>College</th>
                <th>Course</th>
                <th>Year</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {s.firstName[0]}{s.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{s.firstName} {s.lastName}</p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-400 text-sm">{s.college || '—'}</td>
                  <td className="text-slate-400 text-sm">{s.course || '—'}</td>
                  <td className="text-slate-400">{s.year || '—'}</td>
                  <td>
                    <span className={s.isActive ? 'badge-success' : 'badge-danger'}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-slate-500 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => toggle(s._id)} className={`text-xs font-medium ${s.isActive ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}>
                      {s.isActive ? 'Deactivate' : 'Activate'}
                    </button>
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

export default AdminStudents;
