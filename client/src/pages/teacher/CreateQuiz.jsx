import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineCheck } from 'react-icons/hi';

const emptyQuestionForm = () => ({ topicId: '', question: '', options: ['', '', '', ''], correctIndex: null, explanation: '' });

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [topics, setTopics] = useState([]);

  const [details, setDetails] = useState({
    title: '', description: '', questionCount: 5, durationMinutes: 20,
    marksPerQuestion: 1, negativeMarkingEnabled: false, negativeMarksPerQuestion: 0.25,
    startDate: '', endDate: '',
  });

  const [questionForms, setQuestionForms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.data));
  }, []);

  const selectCategory = async (id) => {
    setCategoryId(id);
    const res = await api.get(`/topics?categoryId=${id}`);
    setTopics(res.data.data);
  };

  const goToStep3 = () => {
    if (!details.title.trim()) return toast.error('Quiz title is required');
    if (!details.startDate || !details.endDate) return toast.error('Start and end dates are required');
    if (new Date(details.endDate) <= new Date(details.startDate)) return toast.error('End date must be after start date');
    const count = Number(details.questionCount);
    if (!count || count < 1 || count > 50) return toast.error('Question count must be between 1 and 50');
    if (Number(details.marksPerQuestion) <= 0) return toast.error('Marks per question must be greater than 0');

    setQuestionForms((prev) => {
      const next = [...prev];
      while (next.length < count) next.push(emptyQuestionForm());
      return next.slice(0, count);
    });
    setStep(3);
  };

  const updateQuestionForm = (idx, patch) => {
    setQuestionForms((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const updateOption = (idx, optIdx, value) => {
    setQuestionForms((prev) => prev.map((q, i) => {
      if (i !== idx) return q;
      const options = [...q.options];
      options[optIdx] = value;
      return { ...q, options };
    }));
  };

  const validateQuestions = () => {
    for (let i = 0; i < questionForms.length; i++) {
      const q = questionForms[i];
      if (!q.topicId) return `Question ${i + 1}: select a topic`;
      if (!q.question.trim()) return `Question ${i + 1}: question text is required`;
      if (q.options.some((o) => !o.trim())) return `Question ${i + 1}: all 4 options are required`;
      if (q.correctIndex === null) return `Question ${i + 1}: select the correct answer`;
    }
    return null;
  };

  const submit = async () => {
    const err = validateQuestions();
    if (err) { toast.error(err); return; }

    setLoading(true);
    try {
      const letters = ['A', 'B', 'C', 'D'];
      const payload = {
        title: details.title,
        description: details.description,
        categoryId,
        durationMinutes: Number(details.durationMinutes),
        marksPerQuestion: Number(details.marksPerQuestion),
        negativeMarksPerQuestion: details.negativeMarkingEnabled ? Number(details.negativeMarksPerQuestion) : 0,
        startDate: details.startDate,
        endDate: details.endDate,
        questions: questionForms.map((q) => ({
          topicId: q.topicId,
          question: q.question,
          options: letters.map((l, i) => ({ label: l, text: q.options[i] })),
          correctAnswer: letters[q.correctIndex],
          explanation: q.explanation,
        })),
      };

      const quizRes = await api.post('/quizzes', payload);
      const quizId = quizRes.data.data._id;
      await api.post(`/quizzes/${quizId}/assign`, { assignAll: true });
      toast.success('Quiz created and assigned to all students!');
      navigate('/teacher/quizzes');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-slide-up">
      <h1 className="section-title text-2xl">Create New Quiz</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-3">
        {['Select Category', 'Quiz Details', 'Set Questions'].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step > i + 1 ? 'bg-emerald-600 text-white' : step === i + 1 ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
              {step > i + 1 ? <HiOutlineCheck className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${step === i + 1 ? 'text-white' : 'text-slate-500'}`}>{label}</span>
            {i < 2 && <div className="h-px w-6 bg-slate-700 hidden sm:block" />}
          </div>
        ))}
      </div>

      {/* Step 1: Category */}
      {step === 1 && (
        <div className="card space-y-4">
          <h2 className="font-bold text-white">Select a Category</h2>
          <p className="text-sm text-slate-500">Every question in this quiz will belong to this category.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((c) => (
              <div
                key={c._id}
                onClick={() => selectCategory(c._id)}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${categoryId === c._id ? 'border-primary-500 bg-primary-900/20' : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'}`}
              >
                <div className={`h-5 w-5 rounded border flex items-center justify-center flex-shrink-0 ${categoryId === c._id ? 'border-primary-500 bg-primary-600' : 'border-slate-600'}`}>
                  {categoryId === c._id && <HiOutlineCheck className="h-3 w-3 text-white" />}
                </div>
                <div>
                  <p className="font-medium text-slate-200">{c.name}</p>
                  {c.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{c.description}</p>}
                </div>
              </div>
            ))}
            {categories.length === 0 && <p className="text-slate-500 text-sm">No categories available. Ask an admin to create one first.</p>}
          </div>
          <button
            onClick={() => { if (!categoryId) { toast.error('Select a category'); return; } setStep(2); }}
            className="btn-primary"
          >
            Next: Quiz Details →
          </button>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="card space-y-4">
          <h2 className="font-bold text-white">Quiz Details</h2>
          <div>
            <label className="label">Quiz Title *</label>
            <input className="input" placeholder="Aptitude Assessment — Batch A" value={details.title} onChange={e => setDetails(d => ({ ...d, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Brief description of this quiz..." value={details.description} onChange={e => setDetails(d => ({ ...d, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Number of Questions *</label>
              <input type="number" className="input" min={1} max={50} value={details.questionCount} onChange={e => setDetails(d => ({ ...d, questionCount: e.target.value }))} />
            </div>
            <div>
              <label className="label">Duration (minutes) *</label>
              <input type="number" className="input" min={5} max={180} value={details.durationMinutes} onChange={e => setDetails(d => ({ ...d, durationMinutes: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date *</label>
              <input type="datetime-local" className="input" value={details.startDate} onChange={e => setDetails(d => ({ ...d, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="label">End Date *</label>
              <input type="datetime-local" className="input" value={details.endDate} onChange={e => setDetails(d => ({ ...d, endDate: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Marks per Question *</label>
              <input type="number" className="input" min={0.25} step={0.25} value={details.marksPerQuestion} onChange={e => setDetails(d => ({ ...d, marksPerQuestion: e.target.value }))} />
            </div>
            <div>
              <label className="label flex items-center gap-2">
                <input type="checkbox" checked={details.negativeMarkingEnabled} onChange={e => setDetails(d => ({ ...d, negativeMarkingEnabled: e.target.checked }))} className="accent-primary-500" />
                Enable negative marking
              </label>
              <input
                type="number" className="input" min={0} step={0.25} disabled={!details.negativeMarkingEnabled}
                value={details.negativeMarksPerQuestion}
                onChange={e => setDetails(d => ({ ...d, negativeMarksPerQuestion: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-outline">← Back</button>
            <button onClick={goToStep3} className="btn-primary flex-1 justify-center">Next: Set Questions →</button>
          </div>
        </div>
      )}

      {/* Step 3: Set Questions */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="card space-y-1">
            <h2 className="font-bold text-white">Set Questions</h2>
            <p className="text-sm text-slate-500">Enter {questionForms.length} question{questionForms.length !== 1 ? 's' : ''} for this quiz. Each question needs a topic, 4 options and a correct answer.</p>
          </div>

          {questionForms.map((q, idx) => (
            <div key={idx} className="card space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge-primary">Question {idx + 1}</span>
              </div>

              <div>
                <label className="label">Topic *</label>
                <select className="input" value={q.topicId} onChange={e => updateQuestionForm(idx, { topicId: e.target.value })}>
                  <option value="">Select topic</option>
                  {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Question Text *</label>
                <textarea className="input resize-none" rows={2} value={q.question} onChange={e => updateQuestionForm(idx, { question: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="label">Options — select the radio for the correct answer *</label>
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`correct-${idx}`}
                      checked={q.correctIndex === oIdx}
                      onChange={() => updateQuestionForm(idx, { correctIndex: oIdx })}
                      className="accent-primary-500 h-4 w-4 flex-shrink-0"
                    />
                    <span className="text-xs font-bold text-slate-400 w-4">{String.fromCharCode(65 + oIdx)}</span>
                    <input
                      type="text"
                      placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                      value={opt}
                      onChange={e => updateOption(idx, oIdx, e.target.value)}
                      className="input flex-1"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="label">Explanation (optional)</label>
                <textarea className="input resize-none" rows={2} placeholder="Explain why the answer is correct..." value={q.explanation} onChange={e => updateQuestionForm(idx, { explanation: e.target.value })} />
              </div>
            </div>
          ))}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-outline">← Back</button>
            <button onClick={submit} disabled={loading} className="btn-success flex-1 justify-center">
              {loading ? 'Creating...' : 'Create & Assign to All Students'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateQuiz;
