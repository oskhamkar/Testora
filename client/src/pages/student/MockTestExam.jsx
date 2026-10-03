import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { HiOutlineClock, HiOutlineExclamation } from 'react-icons/hi';

const TestExam = ({ testId, testType = 'mockTest' }) => {
  const navigate = useNavigate();
  const [attemptData, setAttemptData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);
  const [testInfo, setTestInfo] = useState(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const endpoint = testType === 'mockTest'
          ? `/mock-tests/${testId}/start`
          : `/quizzes/${testId}/start`;
        const res = await api.post(endpoint);
        const data = res.data.data;
        setAttemptData(data);
        setQuestions(data.questions || []);
        setTestInfo(data.test || data.quiz);
        const duration = (data.test || data.quiz)?.durationMinutes * 60;
        setTimeLeft(duration);
        startTimeRef.current = new Date(data.startedAt);
      } catch (e) {
        toast.error(e.response?.data?.message || 'Cannot start test');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [testId, testType]);

  const submitTest = useCallback(async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const answerList = Object.entries(answers).map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer }));
    try {
      const endpoint = testType === 'mockTest'
        ? `/mock-tests/${testId}/submit`
        : `/quizzes/${testId}/submit`;
      const res = await api.post(endpoint, {
        attemptId: attemptData.attemptId,
        answers: answerList,
        timeTakenSeconds: timeTaken,
      });
      toast.success(auto ? 'Time up! Test auto-submitted.' : 'Test submitted!');
      navigate(`/student/result/${res.data.data._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Submit failed');
      setSubmitting(false);
    }
  }, [answers, attemptData, testId, testType, submitting]);

  useEffect(() => {
    if (timeLeft === null || !started) return;
    if (timeLeft <= 0) { submitTest(true); return; }
    timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [started, timeLeft, submitTest]);

  if (loading) return <LoadingSpinner fullScreen />;

  // Instructions screen
  if (!started) {
    return (
      <div className="max-w-2xl mx-auto animate-slide-up space-y-6">
        <div className="card text-center">
          <div className="text-5xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-white mb-2">{testInfo?.title}</h1>
          <div className="flex gap-6 justify-center text-sm text-slate-400 mb-6">
            <span>📋 {questions.length} Questions</span>
            <span>⏱ {testInfo?.durationMinutes} Minutes</span>
          </div>
          <div className="bg-amber-900/20 border border-amber-800/30 rounded-xl p-4 text-left mb-6">
            <h3 className="font-semibold text-amber-300 mb-2 flex items-center gap-2">
              <HiOutlineExclamation className="h-5 w-5" /> Instructions
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>• Each question has 4 options. Only one is correct.</li>
              <li>• You can navigate between questions using Next / Previous.</li>
              <li>• Use the question palette to jump to any question.</li>
              <li>• Mark questions for review using the bookmark option.</li>
              <li>• The test will auto-submit when time expires.</li>
              <li>• Once submitted, you cannot retake this test.</li>
            </ul>
          </div>
          <button onClick={() => setStarted(true)} className="btn-primary px-8 py-3 text-base justify-center">
            Start Test
          </button>
        </div>
      </div>
    );
  }

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  const isLow = timeLeft < 300;
  const q = questions[current];

  const getQStatus = (idx) => {
    if (answers[questions[idx]?._id]) return marked[questions[idx]?._id] ? 'marked-answered' : 'answered';
    if (marked[questions[idx]?._id]) return 'marked';
    return 'unanswered';
  };
  const statusStyle = {
    answered: 'bg-emerald-600 text-white',
    'marked-answered': 'bg-purple-600 text-white',
    marked: 'bg-amber-600 text-white',
    unanswered: 'bg-slate-700 text-slate-400',
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6 h-14 bg-slate-900 border-b border-slate-800 flex-shrink-0">
        <h1 className="font-bold text-white text-sm lg:text-base truncate mr-4">{testInfo?.title}</h1>
        <div className={`flex items-center gap-2 font-mono font-bold text-lg px-4 py-1 rounded-lg ${isLow ? 'bg-red-900/40 text-red-400 border border-red-700' : 'bg-slate-800 text-slate-200'}`}>
          <HiOutlineClock className={`h-5 w-5 ${isLow ? 'text-red-400' : 'text-slate-400'}`} />
          {mins}:{secs}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question area */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 lg:p-6">
          <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col gap-4">
            {/* Question */}
            <div className="card flex-1">
              <div className="flex items-start gap-3 mb-6">
                <span className="badge-primary text-sm font-bold flex-shrink-0">Q{current + 1}</span>
                <p className="text-slate-100 font-medium leading-relaxed">{q?.question}</p>
              </div>

              <div className="space-y-3">
                {q?.options?.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => setAnswers(a => ({ ...a, [q._id]: opt.label }))}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all duration-150 ${
                      answers[q._id] === opt.label
                        ? 'bg-primary-900/50 border-primary-500 text-primary-200'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-primary-600 hover:text-white'
                    }`}
                  >
                    <span className={`h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${answers[q._id] === opt.label ? 'bg-primary-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      {opt.label}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} className="btn-outline flex-1 justify-center">
                ← Previous
              </button>
              <button
                onClick={() => setMarked(m => ({ ...m, [q._id]: !m[q._id] }))}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${marked[q._id] ? 'bg-amber-800/30 border-amber-600 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
              >
                {marked[q._id] ? '🔖 Marked' : '🔖 Mark'}
              </button>
              {current < questions.length - 1 ? (
                <button onClick={() => setCurrent(c => c + 1)} className="btn-primary flex-1 justify-center">
                  Next →
                </button>
              ) : (
                <button onClick={() => submitTest(false)} disabled={submitting} className="btn-success flex-1 justify-center">
                  {submitting ? 'Submitting...' : 'Submit Test'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Palette — desktop */}
        <div className="hidden lg:flex flex-col w-56 border-l border-slate-800 bg-slate-900 p-4 overflow-y-auto">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Question Palette</h3>
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
                  idx === current ? 'ring-2 ring-white scale-110' : ''
                } ${statusStyle[getQStatus(idx)]}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 text-xs mt-2">
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-emerald-600" /> Answered</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-amber-600" /> Marked</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-slate-700" /> Not Answered</div>
          </div>

          <div className="mt-auto">
            <button onClick={() => submitTest(false)} disabled={submitting} className="btn-success w-full justify-center text-sm py-2 mt-4">
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MockTestExam = () => {
  const { id } = useParams();
  return <TestExam testId={id} testType="mockTest" />;
};

export { TestExam };
export default MockTestExam;
