import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { HiOutlineBookOpen, HiOutlineChevronRight, HiOutlineTag } from 'react-icons/hi';

const categoryColors = {
  'Quantitative Aptitude': 'from-blue-600 to-primary-600',
  'Logical Reasoning': 'from-emerald-600 to-teal-600',
  'Verbal Ability': 'from-violet-600 to-purple-600',
};
const categoryIcons = {
  'Quantitative Aptitude': '🔢',
  'Logical Reasoning': '🧠',
  'Verbal Ability': '📖',
};

const Topics = () => {
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [catRes, topRes] = await Promise.all([
        api.get('/categories'),
        api.get('/topics'),
      ]);
      setCategories(catRes.data.data);
      setTopics(topRes.data.data);
      if (catRes.data.data.length > 0) setSelected(catRes.data.data[0]._id);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const filteredTopics = topics.filter(t => t.categoryId?._id === selected || t.categoryId === selected);
  const selectedCat = categories.find(c => c._id === selected);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <div>
          <h1 className="section-title text-2xl">Aptitude Topics</h1>
          <p className="text-slate-400 text-sm mt-1">Select a category and explore topics</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-3 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat._id}
            onClick={() => setSelected(cat._id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              selected === cat._id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span>{categoryIcons[cat.name] || '📌'}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Category header */}
      {selectedCat && (
        <div className={`bg-gradient-to-r ${categoryColors[selectedCat.name] || 'from-primary-700 to-indigo-700'} rounded-2xl p-5`}>
          <h2 className="text-xl font-bold text-white">{selectedCat.name}</h2>
          <p className="text-white/70 text-sm mt-1">{selectedCat.description}</p>
        </div>
      )}

      {/* Topics grid */}
      {filteredTopics.length === 0 ? (
        <EmptyState icon="📌" title="No topics found" description="Topics for this category haven't been added yet." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map(topic => (
            <Link
              key={topic._id}
              to={`/student/topics/${topic._id}`}
              className="card-hover group"
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-xl bg-primary-900/50 border border-primary-800/50 flex items-center justify-center mb-3">
                  <HiOutlineTag className="h-5 w-5 text-primary-400" />
                </div>
                <HiOutlineChevronRight className="h-5 w-5 text-slate-600 group-hover:text-primary-400 transition-colors" />
              </div>
              <h3 className="font-semibold text-slate-100 group-hover:text-white transition-colors">{topic.name}</h3>
              <p className="text-slate-500 text-sm mt-1 line-clamp-2">{topic.description}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-primary-400">
                <HiOutlineBookOpen className="h-4 w-4" />
                <span>Explore concepts →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Topics;
