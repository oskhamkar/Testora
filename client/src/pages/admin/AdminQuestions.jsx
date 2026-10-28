import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useConfirm } from '../../components/common/ConfirmDialog';
import {
  HiOutlinePlusCircle, HiOutlinePencil, HiOutlineTrash,
  HiOutlineArrowUpTray, HiOutlineArrowDownTray, HiOutlineMagnifyingGlass,
  HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineCodeBracket
} from 'react-icons/hi2';

const emptyQuestion = {
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
  categoryId: '',
  topicId: '',
};

const SAMPLE_JSON = `{
  "questions": [
    {
      "category": "Quantitative Aptitude",
      "topic": "Percentages",
      "question": "What is 20% of 150?",
      "options": { "A": "20", "B": "30", "C": "40", "D": "50" },
      "correctAnswer": "B",
      "explanation": "20% of 150 = 0.2 x 150 = 30"
    }
  ]
}`;

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const { confirm, ConfirmDialog } = useConfirm();

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');

  // Create/Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyQuestion);
  const [submitting, setSubmitting] = useState(false);

  // CSV import modal
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvUploading, setCsvUploading] = useState(false);

  // JSON import modal
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonUploading, setJsonUploading] = useState(false);
  const [jsonErrors, setJsonErrors] = useState([]);

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
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedTopic) params.topicId = selectedTopic;
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
  }, [selectedCategory, selectedTopic, search]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...emptyQuestion,
      categoryId: selectedCategory || categories[0]?._id || '',
      topicId: '',
    });
    setShowModal(true);
  };

  const openEditModal = (q) => {
    setEditingId(q._id);
    const letters = ['A', 'B', 'C', 'D'];
    setForm({
      question: q.question || '',
      options: letters.map((l) => q.options?.find((o) => o.label === l)?.text || ''),
      correctIndex: letters.indexOf(q.correctAnswer),
      explanation: q.explanation || '',
      categoryId: q.categoryId?._id || q.categoryId || '',
      topicId: q.topicId?._id || q.topicId || '',
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
    if (!form.question.trim()) return toast.error('Question text is required');
    if (form.options.some(opt => !opt.trim())) return toast.error('All 4 options are required');
    if (!form.categoryId) return toast.error('Category is required');
    if (!form.topicId) return toast.error('Topic is required');

    const letters = ['A', 'B', 'C', 'D'];
    const payload = {
      categoryId: form.categoryId,
      topicId: form.topicId,
      question: form.question,
      options: letters.map((l, i) => ({ label: l, text: form.options[i] })),
      correctAnswer: letters[form.correctIndex],
      explanation: form.explanation,
    };

    try {
      setSubmitting(true);
      if (editingId) {
        await api.put(`/questions/${editingId}`, payload);
        toast.success('Question updated successfully');
      } else {
        await api.post('/questions', payload);
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
    if (!(await confirm('This question will be deactivated and removed from quizzes, mock tests and practice lists.', 'Delete this question?'))) return;
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

  const handleJsonUpload = async (e) => {
    e.preventDefault();
    setJsonErrors([]);
    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      return toast.error('Invalid JSON: ' + err.message);
    }

    try {
      setJsonUploading(true);
      const res = await api.post('/questions/import-json', parsed);
      toast.success(res.data.message || 'Questions imported successfully');
      setShowJsonModal(false);
      setJsonText('');
      fetchQuestions();
    } catch (err) {
      const data = err.response?.data;
      toast.error(data?.message || 'Failed to import JSON');
      setJsonErrors(data?.data?.errors || []);
    } finally {
      setJsonUploading(false);
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('categoryId', selectedCategory);
    if (selectedTopic) params.set('topicId', selectedTopic);
    if (search) params.set('search', search);
    const token = localStorage.getItem('testora_token');
    // Use fetch directly to receive the file as a blob with auth header, then trigger download.
    fetch(`/api/questions/export?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok) throw new Error('Export failed');
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `questions-export-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => toast.error('Failed to export questions'));
  };

  const filteredTopics = selectedCategory
    ? topics.filter(t => (t.categoryId?._id || t.categoryId) === selectedCategory)
    : topics;

  const formTopics = form.categoryId
    ? topics.filter(t => (t.categoryId?._id || t.categoryId) === form.categoryId)
    : topics;

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Question Bank Management</h1>
          <p className="text-slate-400 text-sm">Create, edit, delete, import and export questions</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all text-sm border border-slate-700"
          >
            <HiOutlineArrowDownTray className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={() => setShowJsonModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all text-sm border border-slate-700"
          >
            <HiOutlineCodeBracket className="h-4 w-4" /> Import JSON
          </button>
          <button
            onClick={() => setShowCsvModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all text-sm border border-slate-700"
          >
            <HiOutlineArrowUpTray className="h-4 w-4" /> Import CSV
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
      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
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
                    <h3 className="text-white font-medium text-base">{q.question}</h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {q.categoryId?.name || 'Category'}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {q.topicId?.name || 'Topic'}
                      </span>
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
                {q.options?.map((opt) => {
                  const isCorrect = opt.label === q.correctAnswer;
                  return (
                    <div
                      key={opt.label}
                      className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 border ${
                        isCorrect
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                          : 'bg-slate-800/40 text-slate-400 border-slate-800'
                      }`}
                    >
                      <span className="font-semibold uppercase">{opt.label}.</span>
                      <span className="flex-1 truncate">{opt.text}</span>
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
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  placeholder="Enter the question prompt..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value, topicId: '' })}
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
                    value={form.topicId}
                    onChange={(e) => setForm({ ...form, topicId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
                  >
                    <option value="">Select Topic</option>
                    {formTopics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
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
                      name="correctIndex"
                      checked={form.correctIndex === idx}
                      onChange={() => setForm({ ...form, correctIndex: idx })}
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
                Upload a CSV file with columns: <code className="text-primary-400">question, optionA, optionB, optionC, optionD, correctAnswer (A/B/C/D), category, topic, explanation</code>. Rows with errors are skipped; valid rows are still imported.
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
                  <HiOutlineArrowUpTray className="h-8 w-8 text-primary-400 mx-auto" />
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

      {/* JSON Import Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Import Questions via JSON</h2>
              <button onClick={() => { setShowJsonModal(false); setJsonErrors([]); }} className="text-slate-400 hover:text-white">
                <HiOutlineXCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleJsonUpload} className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste JSON matching this documented format. Category and topic names must already exist, and the topic must belong to the category. If <span className="text-amber-400 font-medium">any</span> question fails validation or duplicates an existing question, <span className="text-amber-400 font-medium">nothing</span> is imported.
              </p>
              <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 overflow-x-auto">{SAMPLE_JSON}</pre>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">JSON Payload</label>
                <textarea
                  required
                  rows="8"
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder={SAMPLE_JSON}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-primary-500"
                />
              </div>

              {jsonErrors.length > 0 && (
                <div className="bg-red-950/40 border border-red-900/60 rounded-xl p-3 space-y-1 max-h-40 overflow-y-auto">
                  {jsonErrors.map((e, i) => (
                    <p key={i} className="text-xs text-red-300">
                      {e.index ? `Item ${e.index}: ` : ''}{e.error}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowJsonModal(false); setJsonErrors([]); }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={jsonUploading || !jsonText.trim()}
                  className="px-5 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-500 disabled:opacity-50"
                >
                  {jsonUploading ? 'Importing...' : 'Import JSON'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {ConfirmDialog}
    </div>
  );
};

export default AdminQuestions;
