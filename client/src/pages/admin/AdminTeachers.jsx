import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { HiOutlinePlusCircle, HiOutlinePencil, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">✕</button>
      </div>
      {children}
    </div>
  </div>
);

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', mobile: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const load = async () => {
    const res = await api.get('/admin/teachers');
    setTeachers(res.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditTeacher(null);
    setForm({ firstName: '', lastName: '', email: '', mobile: '', password: '' });
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditTeacher(t);
    setForm({ firstName: t.firstName, lastName: t.lastName, email: t.email, mobile: t.mobile || '', password: '' });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.firstName || !form.lastName || !form.email) { toast.error('Fill required fields'); return; }
    setSaving(true);
    try {
      if (editTeacher) {
        await api.put(`/admin/teachers/${editTeacher._id}`, form);
        toast.success('Teacher updated');
      } else {
        if (!form.password) { toast.error('Password required'); setSaving(false); return; }
        await api.post('/admin/teachers', form);
        toast.success('Teacher created');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const toggle = async (id) => {
    await api.put(`/admin/teachers/${id}/toggle`);
    toast.success('Status updated');
    load();
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="section-title text-2xl">Teachers</h1>
          <p className="text-slate-400 text-sm mt-1">{teachers.length} teachers</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <HiOutlinePlusCircle className="h-5 w-5" /> Add Teacher
        </button>
      </div>

      {teachers.length === 0 ? (
        <EmptyState icon="🧑‍🏫" title="No teachers yet" action={<button onClick={openCreate} className="btn-primary">Add Teacher</button>} />
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Teacher</th><th>Mobile</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {teachers.map(t => (
                <tr key={t._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                        {t.firstName[0]}{t.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{t.firstName} {t.lastName}</p>
                        <p className="text-xs text-slate-500">{t.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-400">{t.mobile || '—'}</td>
                  <td><span className={t.isActive ? 'badge-success' : 'badge-danger'}>{t.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <button onClick={() => openEdit(t)} className="text-primary-400 hover:text-primary-300">
                        <HiOutlinePencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => toggle(t._id)} className={`text-xs font-medium ${t.isActive ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}>
                        {t.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editTeacher ? 'Edit Teacher' : 'Add Teacher'} onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">First Name *</label><input className="input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></div>
              <div><label className="label">Last Name *</label><input className="input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></div>
            </div>
            <div><label className="label">Email *</label><input type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><label className="label">Mobile</label><input className="input" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} /></div>
            {!editTeacher && (
              <div>
                <label className="label">Password *</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} className="input pr-10" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw ? <HiOutlineEye className="h-4 w-4" /> : <HiOutlineEyeOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="btn-outline flex-1 justify-center">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1 justify-center">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminTeachers;
