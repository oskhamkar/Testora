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

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await api.get('/categories');
    setCategories(res.data.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEdit(null); setForm({ name: '', description: '' }); setShowModal(true); };
  const openEdit = (c) => { setEdit(c); setForm({ name: c.name, description: c.description }); setShowModal(true); };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      if (edit) { await api.put(`/categories/${edit._id}`, form); toast.success('Category updated'); }
      else { await api.post('/categories', form); toast.success('Category created'); }
      setShowModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete category?')) return;
    await api.delete(`/categories/${id}`);
    toast.success('Deleted');
    load();
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="section-title text-2xl">Categories</h1>
          <p className="text-slate-400 text-sm mt-1">Manage aptitude categories</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><HiOutlinePlusCircle className="h-5 w-5" /> Add Category</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map(c => (
          <div key={c._id} className="card flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-slate-100">{c.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="text-primary-400 hover:text-primary-300"><HiOutlinePencil className="h-4 w-4" /></button>
                <button onClick={() => del(c._id)} className="text-red-400 hover:text-red-300"><HiOutlineTrash className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="text-slate-500 text-sm flex-1">{c.description}</p>
            <span className={c.isActive ? 'badge-success w-fit' : 'badge-danger w-fit'}>{c.isActive ? 'Active' : 'Inactive'}</span>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={edit ? 'Edit Category' : 'New Category'} onClose={() => setShowModal(false)}>
          <div className="space-y-3">
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

export default AdminCategories;
