import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineHome, HiOutlineBookOpen, HiOutlinePencilAlt,
  HiOutlineClipboardList, HiOutlineChartBar, HiOutlineClock,
  HiOutlineUser, HiOutlineMenu, HiOutlineX, HiOutlineLogout,
  HiOutlineAcademicCap, HiOutlineQuestionMarkCircle,
  HiOutlineUserGroup, HiOutlineTag, HiOutlineFolder,
  HiOutlineCollection, HiOutlineDocumentReport,
} from 'react-icons/hi';

const navConfig = {
  student: [
    { to: '/student/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/student/topics', icon: HiOutlineBookOpen, label: 'Topics' },
    { to: '/student/practice', icon: HiOutlinePencilAlt, label: 'Practice' },
    { to: '/student/mock-tests', icon: HiOutlineClipboardList, label: 'Mock Tests' },
    { to: '/student/quizzes', icon: HiOutlineAcademicCap, label: 'My Quizzes' },
    { to: '/student/performance', icon: HiOutlineChartBar, label: 'Performance' },
    { to: '/student/history', icon: HiOutlineClock, label: 'Test History' },
    { to: '/student/profile', icon: HiOutlineUser, label: 'Profile' },
  ],
  teacher: [
    { to: '/teacher/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/teacher/quizzes', icon: HiOutlineClipboardList, label: 'Quiz Management' },
    { to: '/teacher/questions', icon: HiOutlineQuestionMarkCircle, label: 'Question Bank' },
    { to: '/teacher/profile', icon: HiOutlineUser, label: 'Profile' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/admin/students', icon: HiOutlineUserGroup, label: 'Students' },
    { to: '/admin/teachers', icon: HiOutlineAcademicCap, label: 'Teachers' },
    { to: '/admin/categories', icon: HiOutlineFolder, label: 'Categories' },
    { to: '/admin/topics', icon: HiOutlineTag, label: 'Topics' },
    { to: '/admin/concepts', icon: HiOutlineBookOpen, label: 'Concepts' },
    { to: '/admin/questions', icon: HiOutlineQuestionMarkCircle, label: 'Questions' },
    { to: '/admin/mock-tests', icon: HiOutlineClipboardList, label: 'Mock Tests' },
  ],
};

const roleColors = {
  student: 'from-primary-600 to-indigo-700',
  teacher: 'from-emerald-600 to-teal-700',
  admin: 'from-amber-600 to-orange-700',
};

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = navConfig[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`p-5 bg-gradient-to-r ${roleColors[user?.role] || 'from-primary-600 to-indigo-700'}`}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-white/20 rounded-xl flex items-center justify-center">
            <HiOutlineAcademicCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-none">Testora</h1>
            <p className="text-white/60 text-xs capitalize mt-0.5">{user?.role} Portal</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              isActive(to)
                ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-all duration-150 w-full"
        >
          <HiOutlineLogout className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800">
        <Sidebar />
      </aside>

      {/* Sidebar — mobile */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transform transition-transform duration-300 lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar — mobile */}
        <header className="lg:hidden flex items-center justify-between h-14 px-4 border-b border-slate-800 bg-slate-900/80 glass sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white transition-colors">
            <HiOutlineMenu className="h-6 w-6" />
          </button>
          <span className="font-bold text-white">Testora</span>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
