import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  HiOutlinePlusCircle, HiOutlinePencil, HiOutlineTrash,
  HiOutlineUpload, HiOutlineSearch, HiOutlineFilter,
  HiOutlineCheckCircle, HiOutlineXCircle
} from 'react-icons/hi';

const emptyQuestion = {
  questionText: '',
  options: ['', '', '', ''],
  correctOption: 0,
  explanation: '',
  category: '',
  topic: '',
  difficulty: 'medium',
  marks: 1,
  negativeMarks: 0,
};

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyQuestion);
  const [submitting, setSubmitting] = useState(false);

  // CSV Modal
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [catRes, topRes] = await Promise.all([
        api.get('/categories'),
        api.get('/topics'),
      ]);
      setCategories(catRes.data.data || []);
      setTopics(topRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load categories and topics');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedTopic) params.topic = selectedTopic;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;
      if (search) params.search = search;

      const res = await api.get('/questions', { params });
      setQuestions(res.data.data || []);
    } catch (err) {
      toast.error('Failed to fetch questions');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory, selectedTopic, selectedDifficulty, search]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...emptyQuestion,
      category: categories[0]?._id || '',
      topic: topics[0]?._id || '',
    });
    setShowModal(true);
  };

  const openEditModal = (q) => {
    setEditingId(q._id);
    setForm({
      questionText: q.questionText || '',
      options: q.options?.map(o => typeof o === 'string' ? o : o.text) || ['', '', '', ''],
      correctOption: q.correctOption ?? 0,
      explanation: q.explanation || '',
      category: q.category?._id || q.category || '',
      topic: q.topic?._id || q.topic || '',
      difficulty: q.difficulty || 'medium',
      marks: q.marks || 1,
      negativeMarks: q.negativeMarks || 0,
    });
    setShowModal(true);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm({ ...form, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.questionText.trim()) return toast.error('Question text is required');
    if (form.options.some(opt => !opt.trim())) return toast.error('All 4 options are required');
    if (!form.category) return toast.error('Category is required');
    if (!form.topic) return toast.error('Topic is required');

    try {
      setSubmitting(true);
      if (editingId) {
        await api.put(`/questions/${editingId}`, form);
        toast.success('Question updated successfully');
      } else {
        await api.post('/questions', form);
        toast.success('Question created successfully');
      }
      setShowModal(false);
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      toast.success('Question deleted successfully');
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete question');
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return toast.error('Please select a CSV file');

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      setCsvUploading(true);
      const res = await api.post('/questions/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(res.data.message || 'Questions imported successfully');
      setShowCsvModal(false);
      setCsvFile(null);
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to import CSV');
    } finally {
      setCsvUploading(false);
    }
  };

  const filteredTopics = selectedCategory
    ? topics.filter(t => (t.category?._id || t.category) === selectedCategory)
    : topics;

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Question Bank Management</h1>
          <p className="text-slate-400 text-sm">Create, edit, delete and import CSV questions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCsvModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all text-sm border border-slate-700"
          >
            <HiOutlineUpload className="h-4 w-4" /> Import CSV
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all text-sm shadow-lg shadow-primary-600/25"
          >
            <HiOutlinePlusCircle className="h-5 w-5" /> Add Question
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-primary-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setSelectedTopic(''); }}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
        >
          <option value="">All Topics</option>
          {filteredTopics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Questions list */}
      {questions.length === 0 ? (
        <EmptyState title="No questions found" description="Try adjusting your search or filter settings." />
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q._id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-white font-medium text-base">{q.questionText}</h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {q.category?.name || 'Category'}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {q.topic?.name || 'Topic'}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize ${
                        q.difficulty === 'easy' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        q.difficulty === 'hard' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                        'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="text-xs text-slate-500">Marks: +{q.marks} / -{q.negativeMarks}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(q)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <HiOutlinePencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q._id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                {q.options?.map((opt, oIdx) => {
                  const optText = typeof opt === 'string' ? opt : opt.text;
                  const isCorrect = oIdx === q.correctOption;
                  return (
                    <div
                      key={oIdx}
                      className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 border ${
                        isCorrect
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                          : 'bg-slate-800/40 text-slate-400 border-slate-800'
                      }`}
                    >
                      <span className="font-semibold uppercase">{String.fromCharCode(65 + oIdx)}.</span>
                      <span className="flex-1 truncate">{optText}</span>
                      {isCorrect && <HiOutlineCheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-semibold not-italic text-slate-300">Explanation: </span>{q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">
                {editingId ? 'Edit Question' : 'Create New Question'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <HiOutlineXCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Question Text</label>
                <textarea
                  required
                  rows="3"
                  value={form.questionText}
                  onChange={(e) => setForm({ ...form, questionText: e.target.value })}
                  placeholder="Enter the question prompt..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Topic</label>
                  <select
                    required
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
                  >
                    <option value="">Select Topic</option>
                    {topics
                      .filter(t => !form.category || (t.category?._id || t.category) === form.category)
                      .map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-400">Options (Select radio for correct answer)</label>
                {form.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={form.correctOption === idx}
                      onChange={() => setForm({ ...form, correctOption: idx })}
                      className="accent-primary-500 h-4 w-4"
                    />
                    <span className="text-xs font-bold text-slate-400 w-4">{String.fromCharCode(65 + idx)}</span>
                    <input
                      type="text"
                      required
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Difficulty</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Marks (+)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.marks}
                    onChange={(e) => setForm({ ...form, marks: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Negative Marks (-)</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={form.negativeMarks}
                    onChange={(e) => setForm({ ...form, negativeMarks: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Explanation (Optional)</label>
                <textarea
                  rows="2"
                  value={form.explanation}
                  onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                  placeholder="Explain why the answer is correct..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Import Questions via CSV</h2>
              <button onClick={() => setShowCsvModal(false)} className="text-slate-400 hover:text-white">
                <HiOutlineXCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCsvUpload} className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload a CSV file containing columns: <code className="text-primary-400">questionText, optionA, optionB, optionC, optionD, correctOption (0-3), category, topic, difficulty, explanation</code>.
              </p>

              <div className="p-4 border-2 border-dashed border-slate-700 rounded-xl text-center bg-slate-800/40">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="hidden"
                  id="csvFileInput"
                />
                <label htmlFor="csvFileInput" className="cursor-pointer space-y-2 block">
                  <HiOutlineUpload className="h-8 w-8 text-primary-400 mx-auto" />
                  <span className="text-sm font-medium text-slate-300 block">
                    {csvFile ? csvFile.name : 'Click to select CSV file'}
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCsvModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={csvUploading || !csvFile}
                  className="px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-500 disabled:opacity-50"
                >
                  {csvUploading ? 'Uploading...' : 'Upload & Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestions;
