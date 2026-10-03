import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineAcademicCap, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const Register = () => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', mobile: '',
    password: '', confirmPassword: '', college: '', course: '', year: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.firstName.trim()) return 'First name is required';
    if (!form.lastName.trim()) return 'Last name is required';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Valid email is required';
    if (!form.mobile.match(/^[0-9]{10}$/)) return 'Valid 10-digit mobile number required';
    if (form.password.length < 6) return 'Password must be at least 6 characters';
    if (!/[A-Z]/.test(form.password)) return 'Password must contain at least one uppercase letter';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    if (!form.college.trim()) return 'College name is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      toast.success('Account created successfully!');
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const years = ['1', '2', '3', '4'];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="h-10 w-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <HiOutlineAcademicCap className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Testora</h1>
          </div>
          <p className="text-slate-400">Create your student account to start preparing</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-white mb-5">Student Registration</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name *</label>
                <input className="input" placeholder="Rahul" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input className="input" placeholder="Verma" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Email Address *</label>
                <input type="email" className="input" placeholder="rahul@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label className="label">Mobile Number *</label>
                <input className="input" placeholder="9876543210" maxLength={10} value={form.mobile} onChange={e => set('mobile', e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Password *</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} className="input pr-10" placeholder="Min 6 chars, 1 uppercase" value={form.password} onChange={e => set('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    {showPass ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirm Password *</label>
                <input type="password" className="input" placeholder="Re-enter password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">College Name *</label>
              <input className="input" placeholder="MIT College of Engineering, Pune" value={form.college} onChange={e => set('college', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Course</label>
                <input className="input" placeholder="B.Tech CSE" value={form.course} onChange={e => set('course', e.target.value)} />
              </div>
              <div>
                <label className="label">Year</label>
                <select className="input" value={form.year} onChange={e => set('year', e.target.value)}>
                  <option value="">Select Year</option>
                  {years.map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating account...
                </span>
              ) : 'Create Student Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
