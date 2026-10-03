import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineLightBulb,
  HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineRefresh,
} from 'react-icons/hi';

const Practice = () => {
  const { topicId: paramTopic } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const topicId = paramTopic || searchParams.get('topic');
  const [topic, setTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState({ correct: 0, wrong: 0, skipped: 0 });
  const [history, setHistory] = useState([]); // { questionIdx, selected, result }
  const [sessionDone, setSessionDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Topic selector state (when no topicId)
  const [topics, setTopics] = useState([]);
  const [chosenTopic, setChosenTopic] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!topicId) {
        const res = await api.get('/topics');
        setTopics(res.data.data);
        setLoading(false);
        return;
      }
      try {
        const [topicRes, qRes] = await Promise.all([
          api.get(`/topics/${topicId}`),
          api.get(`/questions/practice/${topicId}`),
        ]);
        setTopic(topicRes.data.data);
        setQuestions(qRes.data.data);
      } catch (e) { toast.error('Failed to load practice'); }
      finally { setLoading(false); }
    };
    load();
  }, [topicId]);

  const submitAnswer = async () => {
    if (!selected) { toast('Please select an answer'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/questions/practice/submit', {
        questionId: questions[current]._id,
        selectedAnswer: selected,
      });
      const data = res.data.data;
      setResult(data);
      setSubmitted(true);
      const isCorrect = data.isCorrect;
      setStats(s => ({
        ...s,
        correct: isCorrect ? s.correct + 1 : s.correct,
        wrong: !isCorrect ? s.wrong + 1 : s.wrong,
      }));
      setHistory(h => [...h, { questionIdx: current, selected, result: data }]);
    } catch (e) { toast.error('Failed to submit answer'); }
    finally { setSubmitting(false); }
  };

  const next = () => {
    if (current + 1 >= questions.length) {
      setSessionDone(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setSubmitted(false);
      setResult(null);
    }
  };

  const skip = () => {
    setStats(s => ({ ...s, skipped: s.skipped + 1 }));
    setHistory(h => [...h, { questionIdx: current, selected: null, result: null }]);
    next();
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setSubmitted(false);
    setResult(null);
    setStats({ correct: 0, wrong: 0, skipped: 0 });
    setHistory([]);
    setSessionDone(false);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  // Topic picker
  if (!topicId) {
    return (
      <div className="max-w-xl mx-auto animate-slide-up space-y-6">
        <h1 className="text-2xl font-bold text-white">Practice Mode</h1>
        <div className="card">
          <h2 className="font-semibold text-slate-200 mb-3">Select a Topic to Practice</h2>
          <select className="input mb-4" value={chosenTopic} onChange={e => setChosenTopic(e.target.value)}>
            <option value="">-- Choose a topic --</option>
            {topics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
          <button
            disabled={!chosenTopic}
            onClick={() => navigate(`/student/practice/${chosenTopic}`)}
            className="btn-primary w-full justify-center"
          >
            Start Practice
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-20">
        <EmptyState icon="📝" title="No questions available" description="No practice questions found for this topic yet." action={<Link to="/student/topics" className="btn-outline">← Back to Topics</Link>} />
      </div>
    );
  }

  // Session done
  if (sessionDone) {
    const total = stats.correct + stats.wrong + stats.skipped;
    const accuracy = total > 0 ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100) || 0 : 0;
    return (
      <div className="max-w-xl mx-auto animate-slide-up space-y-6">
        <div className="text-center card">
          <div className="text-5xl mb-3">🎯</div>
          <h2 className="text-2xl font-bold text-white mb-1">Practice Complete!</h2>
          <p className="text-slate-400 text-sm mb-6">{topic?.name}</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-emerald-900/30 border border-emerald-800/40 rounded-xl p-3">
              <div className="text-2xl font-bold text-emerald-400">{stats.correct}</div>
              <div className="text-xs text-slate-400">Correct</div>
            </div>
            <div className="bg-red-900/30 border border-red-800/40 rounded-xl p-3">
              <div className="text-2xl font-bold text-red-400">{stats.wrong}</div>
              <div className="text-xs text-slate-400">Wrong</div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
              <div className="text-2xl font-bold text-slate-400">{stats.skipped}</div>
              <div className="text-xs text-slate-400">Skipped</div>
            </div>
          </div>
          <div className="text-3xl font-bold text-primary-400 mb-1">{accuracy}%</div>
          <p className="text-slate-400 text-sm mb-6">Accuracy</p>
          <div className="flex gap-3 justify-center">
            <button onClick={restart} className="btn-primary">
              <HiOutlineRefresh className="h-4 w-4" /> Practice Again
            </button>
            <Link to="/student/topics" className="btn-outline">Browse Topics</Link>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-2xl mx-auto animate-slide-up space-y-4">
      <div className="flex items-center justify-between">
        <Link to={`/student/topics/${topicId}`} className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors">
          <HiOutlineArrowLeft className="h-4 w-4" /> {topic?.name}
        </Link>
        <span className="text-slate-500 text-sm">{current + 1} / {questions.length}</span>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-primary-600 rounded-full transition-all duration-500" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 text-sm">
        <span className="text-emerald-400 font-medium">{stats.correct} correct</span>
        <span className="text-red-400 font-medium">{stats.wrong} wrong</span>
        <span className="text-slate-500">{stats.skipped} skipped</span>
      </div>

      {/* Question */}
      <div className="card">
        <div className="flex items-start gap-3 mb-5">
          <span className="bg-primary-900/50 text-primary-300 text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0">Q{current + 1}</span>
          <p className="text-slate-100 font-medium leading-relaxed">{q.question}</p>
        </div>

        <div className="space-y-2.5">
          {q.options?.map((opt, i) => {
            let style = 'bg-slate-800 border-slate-700 text-slate-300 hover:border-primary-500 hover:text-white';
            if (submitted) {
              if (opt.label === result?.correctAnswer) style = 'bg-emerald-900/40 border-emerald-500 text-emerald-300';
              else if (opt.label === selected && !result?.isCorrect) style = 'bg-red-900/40 border-red-500 text-red-300';
              else style = 'bg-slate-800 border-slate-700 text-slate-500';
            } else if (selected === opt.label) {
              style = 'bg-primary-900/40 border-primary-500 text-primary-200';
            }

            return (
              <button
                key={opt.label}
                onClick={() => !submitted && setSelected(opt.label)}
                disabled={submitted}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150 text-left ${style}`}
              >
                <span className="font-bold text-sm w-6 flex-shrink-0">{opt.label}.</span>
                <span className="text-sm">{opt.text}</span>
                {submitted && opt.label === result?.correctAnswer && <HiOutlineCheckCircle className="h-5 w-5 ml-auto flex-shrink-0 text-emerald-400" />}
                {submitted && opt.label === selected && !result?.isCorrect && opt.label !== result?.correctAnswer && <HiOutlineXCircle className="h-5 w-5 ml-auto flex-shrink-0 text-red-400" />}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {submitted && result?.explanation && (
          <div className="mt-4 bg-amber-900/20 border border-amber-800/40 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <HiOutlineLightBulb className="h-4 w-4 text-amber-400" />
              <span className="text-amber-400 text-sm font-semibold">Explanation</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{result.explanation}</p>
          </div>
        )}

        {/* Result banner */}
        {submitted && (
          <div className={`mt-3 rounded-xl px-4 py-2.5 flex items-center gap-2 animate-fade-in ${result?.isCorrect ? 'bg-emerald-900/30 border border-emerald-800/40' : 'bg-red-900/30 border border-red-800/40'}`}>
            {result?.isCorrect
              ? <><HiOutlineCheckCircle className="h-5 w-5 text-emerald-400" /><span className="text-emerald-300 text-sm font-medium">Correct! Well done.</span></>
              : <><HiOutlineXCircle className="h-5 w-5 text-red-400" /><span className="text-red-300 text-sm font-medium">Incorrect. Correct: {result?.correctAnswer}</span></>
            }
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {!submitted ? (
          <>
            <button onClick={skip} className="btn-outline flex-1 justify-center">Skip</button>
            <button onClick={submitAnswer} disabled={!selected || submitting} className="btn-primary flex-1 justify-center">
              {submitting ? 'Checking...' : 'Submit Answer'}
            </button>
          </>
        ) : (
          <button onClick={next} className="btn-primary flex-1 justify-center">
            {current + 1 >= questions.length ? 'Finish Practice' : <>Next Question <HiOutlineArrowRight className="h-4 w-4" /></>}
          </button>
        )}
      </div>
    </div>
  );
};

export default Practice;
