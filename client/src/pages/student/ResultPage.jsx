import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock,
  HiOutlineLightBulb, HiOutlineChartBar, HiOutlineArrowLeft,
} from 'react-icons/hi';

const ResultPage = () => {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    api.get(`/performance/attempts/${id}`)
      .then(r => setAttempt(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!attempt) return <div className="text-center py-20 text-slate-400">Result not found</div>;

  const timeTaken = attempt.timeTakenSeconds;
  const mins = Math.floor(timeTaken / 60).toString().padStart(2, '0');
  const secs = (timeTaken % 60).toString().padStart(2, '0');
  const acc = attempt.accuracy;
  const accColor = acc >= 80 ? 'text-emerald-400' : acc >= 60 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
      <Link to="/student/history" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
        <HiOutlineArrowLeft className="h-4 w-4" /> Test History
      </Link>

      {/* Score card */}
      <div className="card text-center">
        <div className="text-5xl mb-4">{acc >= 80 ? '🏆' : acc >= 60 ? '👍' : '📚'}</div>
        <h2 className="text-xl font-bold text-white mb-1">Test Completed!</h2>
        <p className="text-slate-400 text-sm mb-4">{attempt.testTitle}</p>

        <div className={`text-6xl font-bold ${accColor} mb-2`}>{acc}%</div>
        <p className="text-slate-400 text-sm mb-6">
          {attempt.correctAnswers} / {attempt.totalQuestions} correct
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-emerald-900/30 border border-emerald-800/30 rounded-xl p-3">
            <div className="text-xl font-bold text-emerald-400">{attempt.correctAnswers}</div>
            <div className="text-xs text-slate-400">Correct</div>
          </div>
          <div className="bg-red-900/30 border border-red-800/30 rounded-xl p-3">
            <div className="text-xl font-bold text-red-400">{attempt.wrongAnswers}</div>
            <div className="text-xs text-slate-400">Wrong</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-3">
            <div className="text-xl font-bold text-slate-400">{attempt.skippedAnswers}</div>
            <div className="text-xs text-slate-400">Skipped</div>
          </div>
          <div className="bg-sky-900/30 border border-sky-800/30 rounded-xl p-3">
            <div className="text-xl font-bold text-sky-400">{mins}:{secs}</div>
            <div className="text-xs text-slate-400">Time Taken</div>
          </div>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => setShowReview(!showReview)} className="btn-outline">
            {showReview ? 'Hide Review' : 'Review Answers'}
          </button>
          <Link to="/student/mock-tests" className="btn-primary">
            <HiOutlineChartBar className="h-4 w-4" /> More Tests
          </Link>
          <Link to="/student/performance" className="btn-secondary">
            View Performance
          </Link>
        </div>
      </div>

      {/* Topic Performance */}
      {attempt.topicPerformance?.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <HiOutlineChartBar className="h-5 w-5 text-primary-400" /> Topic Performance
          </h3>
          <div className="space-y-3">
            {attempt.topicPerformance.map((tp, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-300">{tp.topicName || 'Unknown'}</span>
                  <span className={`text-sm font-bold ${tp.accuracy >= 80 ? 'text-emerald-400' : tp.accuracy >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                    {tp.accuracy}%
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${tp.accuracy >= 80 ? 'bg-emerald-500' : tp.accuracy >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${tp.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer Review */}
      {showReview && (
        <div className="card space-y-4">
          <h3 className="font-bold text-white">Detailed Answer Review</h3>
          {attempt.answers?.map((ans, idx) => {
            const q = ans.questionId;
            if (!q || typeof q === 'string') return null;
            return (
              <div key={idx} className={`border rounded-xl p-4 ${ans.isCorrect ? 'border-emerald-800/40 bg-emerald-900/10' : ans.selectedAnswer ? 'border-red-800/40 bg-red-900/10' : 'border-slate-700 bg-slate-800/30'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-xs font-bold text-slate-500 flex-shrink-0 mt-0.5">Q{idx + 1}</span>
                  <p className="text-slate-200 text-sm font-medium">{q.question}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-slate-500 text-xs">Your Answer: </span>
                    <span className={`font-semibold ${ans.isCorrect ? 'text-emerald-400' : ans.selectedAnswer ? 'text-red-400' : 'text-slate-500'}`}>
                      {ans.selectedAnswer || 'Not answered'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">Correct: </span>
                    <span className="font-semibold text-emerald-400">{ans.correctAnswer}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  {ans.isCorrect
                    ? <><HiOutlineCheckCircle className="h-4 w-4 text-emerald-400" /><span className="text-emerald-400 text-xs font-medium">Correct</span></>
                    : ans.selectedAnswer
                    ? <><HiOutlineXCircle className="h-4 w-4 text-red-400" /><span className="text-red-400 text-xs font-medium">Incorrect</span></>
                    : <span className="text-slate-500 text-xs">Skipped</span>
                  }
                </div>
                {q.explanation && (
                  <div className="bg-amber-900/20 border border-amber-800/30 rounded-lg px-3 py-2 mt-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <HiOutlineLightBulb className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-amber-400 text-xs font-semibold">Explanation</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResultPage;
