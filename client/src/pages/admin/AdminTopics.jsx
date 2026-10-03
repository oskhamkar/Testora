import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { HiOutlinePlusCircle, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
      </div>
      {children}
    </div>
  </div>
);

const AdminTopics = () => {
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', categoryId: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const params = filterCat ? `?categoryId=${filterCat}` : '';
    const [topRes, catRes] = await Promise.all([api.get(`/topics${params}`), api.get('/categories')]);
    setTopics(topRes.data.data);
    setCategories(catRes.data.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, [filterCat]);

  const openCreate = () => { setEdit(null); setForm({ name: '', description: '', categoryId: '' }); setShowModal(true); };
  const openEdit = (t) => { setEdit(t); setForm({ name: t.name, description: t.description, categoryId: t.categoryId?._id || t.categoryId }); setShowModal(true); };

  const save = async () => {
    if (!form.name || !form.categoryId) { toast.error('Name and category required'); return; }
    setSaving(true);
    try {
      if (edit) { await api.put(`/topics/${edit._id}`, form); toast.success('Topic updated'); }
      else { await api.post('/topics', form); toast.success('Topic created'); }
      setShowModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete topic?')) return;
    await api.delete(`/topics/${id}`);
    toast.success('Deleted');
    load();
  };

  if (loading && topics.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header flex-wrap gap-3">
        <div>
          <h1 className="section-title text-2xl">Topics</h1>
          <p className="text-slate-400 text-sm mt-1">{topics.length} topics</p>
        </div>
        <div className="flex gap-2">
          <select className="input" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button onClick={openCreate} className="btn-primary"><HiOutlinePlusCircle className="h-5 w-5" /> Add Topic</button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead><tr><th>Topic</th><th>Category</th><th>Description</th><th>Actions</th></tr></thead>
          <tbody>
            {topics.map(t => (
              <tr key={t._id}>
                <td className="font-medium text-slate-200">{t.name}</td>
                <td><span className="badge-primary">{t.categoryId?.name || '—'}</span></td>
                <td className="text-slate-400 text-sm max-w-xs truncate">{t.description}</td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(t)} className="text-primary-400 hover:text-primary-300"><HiOutlinePencil className="h-4 w-4" /></button>
                    <button onClick={() => del(t._id)} className="text-red-400 hover:text-red-300"><HiOutlineTrash className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={edit ? 'Edit Topic' : 'New Topic'} onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <div><label className="label">Category *</label>
              <select className="input" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="label">Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="label">Description</label><textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
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

export default AdminTopics;
