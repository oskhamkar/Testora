import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { HiOutlinePlusCircle, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-2xl my-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
      </div>
      {children}
    </div>
  </div>
);

const AdminConcepts = () => {
  const [concepts, setConcepts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterTopic, setFilterTopic] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ topicId: '', title: '', content: '', formulas: '', examples: '', importantPoints: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterTopic) params.set('topicId', filterTopic);
    const [conRes, topRes, catRes] = await Promise.all([
      api.get(`/concepts?${params}`),
      api.get('/topics'),
      api.get('/categories'),
    ]);
    setConcepts(conRes.data.data);
    setTopics(topRes.data.data);
    setCategories(catRes.data.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, [filterTopic]);

  const filteredTopics = filterCat ? topics.filter(t => (t.categoryId?._id || t.categoryId) === filterCat) : topics;

  const toArr = (str) => str ? str.split('\n').filter(s => s.trim()) : [];

  const openCreate = () => {
    setEdit(null);
    setForm({ topicId: '', title: '', content: '', formulas: '', examples: '', importantPoints: '' });
    setShowModal(true);
  };
  const openEdit = (c) => {
    setEdit(c);
    setForm({
      topicId: c.topicId?._id || c.topicId,
      title: c.title,
      content: c.content,
      formulas: (c.formulas || []).join('\n'),
      examples: (c.examples || []).join('\n'),
      importantPoints: (c.importantPoints || []).join('\n'),
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.title || !form.topicId) { toast.error('Title and topic required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        formulas: toArr(form.formulas),
        examples: toArr(form.examples),
        importantPoints: toArr(form.importantPoints),
      };
      if (edit) { await api.put(`/concepts/${edit._id}`, payload); toast.success('Concept updated'); }
      else { await api.post('/concepts', payload); toast.success('Concept created'); }
      setShowModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete concept?')) return;
    await api.delete(`/concepts/${id}`);
    toast.success('Deleted');
    load();
  };

  if (loading && concepts.length === 0) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header flex-wrap gap-3">
        <div>
          <h1 className="section-title text-2xl">Concepts</h1>
          <p className="text-slate-400 text-sm mt-1">{concepts.length} concepts</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select className="input" value={filterCat} onChange={e => { setFilterCat(e.target.value); setFilterTopic(''); }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select className="input" value={filterTopic} onChange={e => setFilterTopic(e.target.value)}>
            <option value="">All Topics</option>
            {filteredTopics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
          <button onClick={openCreate} className="btn-primary"><HiOutlinePlusCircle className="h-5 w-5" /> Add Concept</button>
        </div>
      </div>

      <div className="space-y-3">
        {concepts.map(c => (
          <div key={c._id} className="card flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-200">{c.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{c.topicId?.name}</p>
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">{c.content}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => openEdit(c)} className="text-primary-400 hover:text-primary-300"><HiOutlinePencil className="h-4 w-4" /></button>
              <button onClick={() => del(c._id)} className="text-red-400 hover:text-red-300"><HiOutlineTrash className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={edit ? 'Edit Concept' : 'New Concept'} onClose={() => setShowModal(false)}>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <div>
              <label className="label">Topic *</label>
              <select className="input" value={form.topicId} onChange={e => setForm(f => ({ ...f, topicId: e.target.value }))}>
                <option value="">Select topic</option>
                {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
            <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><label className="label">Content / Explanation</label><textarea className="input resize-none" rows={4} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
            <div><label className="label">Formulas (one per line)</label><textarea className="input resize-none font-mono text-sm" rows={3} value={form.formulas} onChange={e => setForm(f => ({ ...f, formulas: e.target.value }))} /></div>
            <div><label className="label">Examples (one per line)</label><textarea className="input resize-none text-sm" rows={3} value={form.examples} onChange={e => setForm(f => ({ ...f, examples: e.target.value }))} /></div>
            <div><label className="label">Important Points (one per line)</label><textarea className="input resize-none text-sm" rows={3} value={form.importantPoints} onChange={e => setForm(f => ({ ...f, importantPoints: e.target.value }))} /></div>
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

export default AdminConcepts;
