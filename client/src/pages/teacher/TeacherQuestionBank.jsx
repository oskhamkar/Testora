import { useEffect, useState } from 'react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { HiOutlineSearch } from 'react-icons/hi';

const TeacherQuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [filters, setFilters] = useState({ categoryId: '', topicId: '', search: '' });
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 30 });
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.topicId) params.set('topicId', filters.topicId);
    if (filters.search) params.set('search', filters.search);
    const res = await api.get(`/questions?${params}`);
    setQuestions(res.data.data);
    setTotal(res.data.total);
    setLoading(false);
  };

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data));
  }, []);

  useEffect(() => {
    if (filters.categoryId) api.get(`/topics?categoryId=${filters.categoryId}`).then(r => setTopics(r.data.data));
    else setTopics([]);
  }, [filters.categoryId]);

  useEffect(() => { load(); }, [filters.categoryId, filters.topicId]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h1 className="section-title text-2xl">Question Bank</h1>
        <p className="text-slate-400 text-sm mt-1">Browse and view all available questions</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <select className="input flex-1 min-w-40" value={filters.categoryId} onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value, topicId: '' }))}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select className="input flex-1 min-w-40" value={filters.topicId} onChange={e => setFilters(f => ({ ...f, topicId: e.target.value }))}>
          <option value="">All Topics</option>
          {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
        <div className="flex gap-2">
          <input className="input w-48" placeholder="Search..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} onKeyDown={e => e.key === 'Enter' && load()} />
          <button onClick={load} className="btn-secondary px-3"><HiOutlineSearch className="h-5 w-5" /></button>
        </div>
      </div>

      <p className="text-slate-500 text-sm">{total} questions found</p>

      {loading ? <LoadingSpinner /> : questions.length === 0 ? (
        <EmptyState icon="❓" title="No questions found" description="Try adjusting the filters." />
      ) : (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={q._id} className="card py-3">
              <div className="flex items-start gap-3">
                <span className="text-xs text-slate-500 pt-0.5 flex-shrink-0">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200">{q.question}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-slate-500">{q.topicId?.name}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs text-slate-500">{q.categoryId?.name}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherQuestionBank;
