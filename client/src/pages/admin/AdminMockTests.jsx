import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useConfirm } from '../../components/common/ConfirmDialog';
import {
  HiOutlinePlusCircle, HiOutlineTrash,
  HiOutlineXCircle, HiOutlineEye, HiOutlineEyeSlash
} from 'react-icons/hi2';

const emptyMockTest = {
  title: '',
  description: '',
  categoryId: '',
  durationMinutes: 30,
  questionIds: [],
};

const AdminMockTests = () => {
  const [mockTests, setMockTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { confirm, ConfirmDialog } = useConfirm();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyMockTest);
  const [submitting, setSubmitting] = useState(false);
  const [questionSearch, setQuestionSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testRes, catRes, qRes] = await Promise.all([
        api.get('/mock-tests'),
        api.get('/categories'),
        api.get('/questions', { params: { limit: 500 } }),
      ]);
      setMockTests(testRes.data.data || []);
      setCategories(catRes.data.data || []);
      setAvailableQuestions(qRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load mock tests data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ ...emptyMockTest, categoryId: categories[0]?._id || '' });
    setQuestionSearch('');
    setShowModal(true);
  };

  const openEditModal = (mt) => {
    setEditingId(mt._id);
    const firstQuestion = availableQuestions.find(q => mt.questionIds?.some(id => (id._id || id) === q._id));
    setForm({
      title: mt.title || '',
      description: mt.description || '',
      categoryId: firstQuestion?.categoryId?._id || firstQuestion?.categoryId || '',
      durationMinutes: mt.durationMinutes || 30,
      questionIds: mt.questionIds?.map(q => typeof q === 'object' ? q._id : q) || [],
    });
    setQuestionSearch('');
    setShowModal(true);
  };

  const toggleQuestionSelection = (qId) => {
    const selected = form.questionIds.includes(qId);
    if (selected) {
      setForm({ ...form, questionIds: form.questionIds.filter(id => id !== qId) });
    } else {
      setForm({ ...form, questionIds: [...form.questionIds, qId] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (form.questionIds.length === 0) return toast.error('Select at least 1 question');

    const payload = {
      title: form.title,
      description: form.description,
      questionIds: form.questionIds,
      durationMinutes: Number(form.durationMinutes),
    };

    try {
      setSubmitting(true);
      if (editingId) {
        await api.put(`/mock-tests/${editingId}`, payload);
        toast.success('Mock test updated successfully');
      } else {
        await api.post('/mock-tests', payload);
        toast.success('Mock test created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save mock test');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirm('This mock test will be permanently removed. Students will no longer be able to attempt it.', 'Delete this mock test?'))) return;
    try {
      await api.delete(`/mock-tests/${id}`);
      toast.success('Mock test deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete mock test');
    }
  };

  const togglePublish = async (mt) => {
    const verb = mt.isPublished ? 'unpublish' : 'publish';
    if (!(await confirm(
      mt.isPublished
        ? 'Students will no longer see this mock test in their list.'
        : 'This mock test will become visible and attemptable by all students.',
      `${verb === 'publish' ? 'Publish' : 'Unpublish'} this mock test?`
    ))) return;
    try {
      await api.put(`/mock-tests/${mt._id}`, { isPublished: !mt.isPublished });
      toast.success(`Mock test ${mt.isPublished ? 'unpublished' : 'published'}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update mock test');
    }
  };

  const filteredQuestions = availableQuestions.filter(q => {
    const textMatch = q.question?.toLowerCase().includes(questionSearch.toLowerCase());
    const catMatch = !form.categoryId || (q.categoryId?._id || q.categoryId) === form.categoryId;
    return textMatch && catMatch;
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Mock Test Management</h1>
          <p className="text-slate-400 text-sm">Create and manage full-length mock practice tests for students</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-all text-sm shadow-lg shadow-primary-600/25"
        >
          <HiOutlinePlusCircle className="h-5 w-5" /> Create Mock Test
        </button>
      </div>

      {/* Test List */}
      {mockTests.length === 0 ? (
        <EmptyState title="No mock tests created" description="Click 'Create Mock Test' above to add your first test." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTests.map((test) => (
            <div key={test._id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className={test.isPublished ? 'badge-success' : 'badge-secondary'}>
                    {test.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePublish(test)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title={test.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {test.isPublished ? <HiOutlineEyeSlash className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(test._id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">{test.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{test.description || 'No description provided.'}</p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-800/40 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Questions</span>
                  <span className="text-white font-bold text-sm">{test.questionIds?.length || 0}</span>
                </div>
                <div className="bg-slate-800/40 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block">Duration</span>
                  <span className="text-white font-bold text-sm">{test.durationMinutes}m</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 space-y-5 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">
                {editingId ? 'Edit Mock Test' : 'Create Mock Test'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <HiOutlineXCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-2 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Test Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grand Aptitude Mock Test 2026"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                  <textarea
                    rows="2"
                    placeholder="Brief description of the test syllabus and guidelines..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Filter Questions by Category</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-slate-200 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Questions Picker */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Select Questions ({form.questionIds.length} selected)
                  </label>
                  <div className="relative w-48">
                    <input
                      type="text"
                      placeholder="Filter questions..."
                      value={questionSearch}
                      onChange={(e) => setQuestionSearch(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-2 border border-slate-800 rounded-xl p-2 bg-slate-950/50">
                  {filteredQuestions.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No matching questions found.</p>
                  ) : (
                    filteredQuestions.map((q) => {
                      const selected = form.questionIds.includes(q._id);
                      return (
                        <div
                          key={q._id}
                          onClick={() => toggleQuestionSelection(q._id)}
                          className={`p-2.5 rounded-xl cursor-pointer text-xs flex items-center justify-between transition-all border ${
                            selected
                              ? 'bg-primary-950/50 border-primary-500/50 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="truncate flex-1 pr-3">{q.question}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${
                            selected ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {selected ? 'Selected' : '+ Add'}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
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
                  {submitting ? 'Saving...' : editingId ? 'Update Mock Test' : 'Create Mock Test'}
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

export default AdminMockTests;
