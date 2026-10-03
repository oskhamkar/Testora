import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    mobile: user?.mobile || '',
    college: user?.college || '',
    course: user?.course || '',
    year: user?.year || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', form);
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setPwLoading(false); }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-slide-up">
      <div>
        <h1 className="section-title text-2xl">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account information</p>
      </div>

      {/* Avatar */}
      <div className="card flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <h2 className="font-bold text-white text-lg">{user?.firstName} {user?.lastName}</h2>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          <span className="badge-primary mt-1">Student</span>
        </div>
      </div>

      {/* Profile form */}
      <div className="card">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <HiOutlineUser className="h-5 w-5 text-primary-400" /> Personal Information
        </h3>
        <form onSubmit={handleProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input className="input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input className="input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Mobile</label>
              <input className="input" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} />
            </div>
            <div>
              <label className="label">Year</label>
              <select className="input" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}>
                <option value="">Select</option>
                {['1','2','3','4'].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">College</label>
            <input className="input" value={form.college} onChange={e => setForm(f => ({ ...f, college: e.target.value }))} />
          </div>
          <div>
            <label className="label">Course</label>
            <input className="input" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input opacity-50 cursor-not-allowed" value={user?.email} disabled />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card">
        <h3 className="font-bold text-white mb-4">Change Password</h3>
        <form onSubmit={handlePassword} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} className="input pr-10" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPw ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} />
          </div>
          <button type="submit" disabled={pwLoading} className="btn-outline">
            {pwLoading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
