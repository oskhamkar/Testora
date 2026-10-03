import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  HiOutlineBookOpen, HiOutlineChevronDown, HiOutlineChevronUp,
  HiOutlineLightBulb, HiOutlineCalculator, HiOutlineArrowLeft,
  HiOutlinePencilAlt,
} from 'react-icons/hi';

const ConceptCard = ({ concept }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="card border-slate-800">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary-900/40 flex items-center justify-center">
            <HiOutlineLightBulb className="h-4 w-4 text-primary-400" />
          </div>
          <span className="font-semibold text-slate-100">{concept.title}</span>
        </div>
        {open ? <HiOutlineChevronUp className="h-5 w-5 text-slate-400" /> : <HiOutlineChevronDown className="h-5 w-5 text-slate-400" />}
      </button>

      {open && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-fade-in">
          {concept.content && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Explanation</h4>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{concept.content}</p>
            </div>
          )}

          {concept.formulas?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <HiOutlineCalculator className="h-3.5 w-3.5" /> Key Formulas
              </h4>
              <div className="space-y-1.5">
                {concept.formulas.map((f, i) => (
                  <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-300 font-mono">
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}

          {concept.examples?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Examples</h4>
              <div className="space-y-2">
                {concept.examples.map((ex, i) => (
                  <div key={i} className="bg-emerald-900/20 border border-emerald-800/30 rounded-lg px-3 py-2 text-sm text-emerald-300">
                    {ex}
                  </div>
                ))}
              </div>
            </div>
          )}

          {concept.importantPoints?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Important Points</h4>
              <ul className="space-y-1.5">
                {concept.importantPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-primary-400 mt-0.5">•</span> {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TopicDetail = () => {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [concepts, setConcepts] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [topicRes, conceptsRes, questionsRes] = await Promise.all([
          api.get(`/topics/${id}`),
          api.get(`/concepts?topicId=${id}`),
          api.get(`/questions?topicId=${id}&limit=1`),
        ]);
        setTopic(topicRes.data.data);
        setConcepts(conceptsRes.data.data);
        setQuestionCount(questionsRes.data.total || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!topic) return <div className="text-center text-slate-400 py-20">Topic not found</div>;

  return (
    <div className="space-y-6 animate-slide-up max-w-3xl">
      <Link to="/student/topics" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
        <HiOutlineArrowLeft className="h-4 w-4" /> Back to Topics
      </Link>

      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span>{topic.categoryId?.name || 'Category'}</span>
        </div>
        <h1 className="text-3xl font-bold text-white">{topic.name}</h1>
        <p className="text-slate-400 mt-2">{topic.description}</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="bg-slate-800 rounded-xl px-4 py-2.5 text-sm">
          <span className="text-slate-500">Concepts: </span>
          <span className="text-primary-400 font-semibold">{concepts.length}</span>
        </div>
        <div className="bg-slate-800 rounded-xl px-4 py-2.5 text-sm">
          <span className="text-slate-500">Questions: </span>
          <span className="text-emerald-400 font-semibold">{questionCount}</span>
        </div>
      </div>

      {/* Concepts */}
      {concepts.length > 0 && (
        <div>
          <h2 className="section-title text-lg mb-3 flex items-center gap-2">
            <HiOutlineBookOpen className="h-5 w-5 text-primary-400" /> Concepts
          </h2>
          <div className="space-y-3">
            {concepts.map(c => <ConceptCard key={c._id} concept={c} />)}
          </div>
        </div>
      )}

      {/* Practice CTA */}
      {questionCount > 0 && (
        <div className="bg-gradient-to-r from-primary-900/60 to-indigo-900/40 border border-primary-800/40 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white">Ready to practice?</h3>
            <p className="text-slate-400 text-sm mt-1">{questionCount} questions available for this topic</p>
          </div>
          <Link to={`/student/practice/${id}`} className="btn-primary whitespace-nowrap">
            <HiOutlinePencilAlt className="h-4 w-4" /> Start Practice
          </Link>
        </div>
      )}
    </div>
  );
};

export default TopicDetail;
