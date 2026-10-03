import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { HiOutlineSearch, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', description: '', durationMinutes: 20,
    startDate: '', endDate: '',
  });
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filters, setFilters] = useState({ categoryId: '', topicId: '', search: '' });
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [assignAll, setAssignAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qLoading, setQLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [catRes, studRes] = await Promise.all([
        api.get('/categories'),
        api.get('/admin/students?limit=100'),
      ]);
      setCategories(catRes.data.data);
      setStudents(studRes.data.data);
    };
    load();
  }, []);

  useEffect(() => {
    if (filters.categoryId) {
      api.get(`/topics?categoryId=${filters.categoryId}`).then(r => setTopics(r.data.data));
    }
  }, [filters.categoryId]);

  const searchQuestions = async () => {
    setQLoading(true);
    const params = new URLSearchParams();
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.topicId) params.set('topicId', filters.topicId);
    if (filters.search) params.set('search', filters.search);
    params.set('limit', '50');
    const res = await api.get(`/questions?${params}`);
    setQuestions(res.data.data);
    setQLoading(false);
  };

  useEffect(() => { searchQuestions(); }, [filters.categoryId, filters.topicId]);

  const toggleQ = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };

  const submit = async () => {
    if (!form.title) { toast.error('Quiz title required'); return; }
    if (selected.length === 0) { toast.error('Select at least one question'); return; }
    if (!assignAll && selectedStudents.length === 0) { toast.error('Select students or assign to all'); return; }

    setLoading(true);
    try {
      const quizRes = await api.post('/quizzes', {
        ...form,
        questionIds: selected,
        durationMinutes: Number(form.durationMinutes),
      });
      const quizId = quizRes.data.data._id;
      await api.post(`/quizzes/${quizId}/assign`, {
        studentIds: assignAll ? [] : selectedStudents,
        assignAll,
      });
      toast.success('Quiz created and assigned!');
      navigate('/teacher/quizzes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quiz');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-slide-up">
      <h1 className="section-title text-2xl">Create New Quiz</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {['Quiz Details', 'Select Questions', 'Assign Students'].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step > i + 1 ? 'bg-emerald-600 text-white' : step === i + 1 ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
              {step > i + 1 ? <HiOutlineCheck className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${step === i + 1 ? 'text-white' : 'text-slate-500'}`}>{label}</span>
            {i < 2 && <div className="h-px w-6 bg-slate-700 hidden sm:block" />}
          </div>
        ))}
      </div>

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="card space-y-4">
          <h2 className="font-bold text-white">Quiz Details</h2>
          <div>
            <label className="label">Quiz Title *</label>
            <input className="input" placeholder="Aptitude Assessment — Batch A" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Brief description of this quiz..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Duration (minutes)</label>
              <input type="number" className="input" min={5} max={180} value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))} />
            </div>
            <div>
              <label className="label">Start Date *</label>
              <input type="datetime-local" className="input" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="label">End Date *</label>
              <input type="datetime-local" className="input" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
          <button onClick={() => { if (!form.title || !form.startDate || !form.endDate) { toast.error('Fill all required fields'); return; } setStep(2); }} className="btn-primary">
            Next: Select Questions →
          </button>
        </div>
      )}

      {/* Step 2: Questions */}
      {step === 2 && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white">Select Questions</h2>
            <span className="badge-primary">{selected.length} selected</span>
          </div>

          <div className="flex gap-3 flex-wrap">
            <select className="input flex-1 min-w-32" value={filters.categoryId} onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value, topicId: '' }))}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <select className="input flex-1 min-w-32" value={filters.topicId} onChange={e => setFilters(f => ({ ...f, topicId: e.target.value }))}>
              <option value="">All Topics</option>
              {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            <div className="flex gap-2 flex-1">
              <input className="input flex-1" placeholder="Search questions..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} onKeyDown={e => e.key === 'Enter' && searchQuestions()} />
              <button onClick={searchQuestions} className="btn-secondary px-3"><HiOutlineSearch className="h-5 w-5" /></button>
            </div>
          </div>

          {qLoading ? <LoadingSpinner size="sm" /> : (
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {questions.map(q => (
                <div
                  key={q._id}
                  onClick={() => toggleQ(q._id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selected.includes(q._id) ? 'border-primary-500 bg-primary-900/20' : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'}`}
                >
                  <div className={`h-5 w-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${selected.includes(q._id) ? 'border-primary-500 bg-primary-600' : 'border-slate-600'}`}>
                    {selected.includes(q._id) && <HiOutlineCheck className="h-3 w-3 text-white" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-200 line-clamp-2">{q.question}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{q.topicId?.name || q.categoryId?.name}</p>
                  </div>
                </div>
              ))}
              {questions.length === 0 && <p className="text-center text-slate-500 py-4">No questions found. Try adjusting filters.</p>}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-outline">← Back</button>
            <button onClick={() => { if (selected.length === 0) { toast.error('Select at least one question'); return; } setStep(3); }} className="btn-primary flex-1 justify-center">
              Next: Assign Students →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Assign */}
      {step === 3 && (
        <div className="card space-y-4">
          <h2 className="font-bold text-white">Assign to Students</h2>

          <div
            onClick={() => setAssignAll(!assignAll)}
            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer ${assignAll ? 'border-emerald-500 bg-emerald-900/20' : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'}`}
          >
            <div className={`h-5 w-5 rounded border flex items-center justify-center ${assignAll ? 'border-emerald-500 bg-emerald-600' : 'border-slate-600'}`}>
              {assignAll && <HiOutlineCheck className="h-3 w-3 text-white" />}
            </div>
            <span className="font-medium text-slate-200">Assign to ALL Students</span>
          </div>

          {!assignAll && (
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {students.map(s => (
                <div
                  key={s._id}
                  onClick={() => setSelectedStudents(prev => prev.includes(s._id) ? prev.filter(x => x !== s._id) : [...prev, s._id])}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedStudents.includes(s._id) ? 'border-primary-500 bg-primary-900/20' : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'}`}
                >
                  <div className={`h-5 w-5 rounded border flex items-center justify-center ${selectedStudents.includes(s._id) ? 'border-primary-500 bg-primary-600' : 'border-slate-600'}`}>
                    {selectedStudents.includes(s._id) && <HiOutlineCheck className="h-3 w-3 text-white" />}
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {s.firstName[0]}{s.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{s.firstName} {s.lastName}</p>
                    <p className="text-xs text-slate-500">{s.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!assignAll && <p className="text-sm text-slate-500">{selectedStudents.length} students selected</p>}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-outline">← Back</button>
            <button onClick={submit} disabled={loading} className="btn-success flex-1 justify-center">
              {loading ? 'Creating...' : '🚀 Create & Assign Quiz'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateQuiz;
