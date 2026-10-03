import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineAcademicCap, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.firstName}!`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogins = [
    { label: 'Admin', email: 'admin@testora.com', password: 'Admin@123', color: 'text-amber-400' },
    { label: 'Teacher', email: 'teacher@testora.com', password: 'Teacher@123', color: 'text-emerald-400' },
    { label: 'Student', email: 'rahul@testora.com', password: 'Student@123', color: 'text-primary-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-900 via-indigo-900 to-slate-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary-800/30 via-transparent to-transparent" />
        <div className="relative z-10 text-center max-w-md">
          <div className="h-20 w-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
            <HiOutlineAcademicCap className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Testora</h1>
          <p className="text-xl text-primary-200 mb-6">Smart Aptitude Preparation</p>
          <p className="text-slate-300 leading-relaxed">
            Master aptitude concepts, practice topic-wise questions, take mock tests, 
            and track your performance — all in one place.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {[['50+', 'Questions'], ['5', 'Mock Tests'], ['3', 'Modules']].map(([num, lbl]) => (
              <div key={lbl} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <div className="text-2xl font-bold text-white">{num}</div>
                <div className="text-primary-300 text-sm">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <HiOutlineAcademicCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Testora</h1>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-slate-400 text-sm mb-6">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPass ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-500">
              New student?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                Create an account
              </Link>
            </p>
          </div>

          {/* Demo credentials */}
          {/* <div className="mt-4 card bg-slate-900/50">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Demo Login</p>
            <div className="space-y-2">
              {demoLogins.map(({ label, email, password, color }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setForm({ email, password })}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
                >
                  <span className={`font-medium ${color}`}>{label}</span>
                  <span className="text-slate-500 text-xs">{email}</span>
                </button>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
