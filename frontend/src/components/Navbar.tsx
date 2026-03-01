import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { UserRole } from '../types';
import { api } from '../services/api';

const BUTTON_CLASS = "w-full min-w-[180px] px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-center";

export function Navbar({ children }: { children: React.ReactNode }) {
  const { currentUser, switchUser } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleRoleSwitch = async () => {
    if (currentUser?.role === UserRole.STUDENT) {
      await switchUser('2', UserRole.STAFF);
      navigate('/staff');
    } else {
      await switchUser('1', UserRole.STUDENT);
      navigate('/student');
    }
  };

  const getRoleDisplayName = () => {
    if (currentUser?.role === UserRole.STUDENT) return 'Staff';
    return 'Student';
  };

  const handleLogout = () => {
    api.setAccessToken(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    navigate('/login');
    window.location.reload();
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      onClick={closeSidebar}
      className={`${BUTTON_CLASS} block ${
        location.pathname === to
          ? 'bg-violet-600 text-white'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <>
      {/* Top bar - minimal */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link
              to="/"
              className="text-lg font-bold text-slate-800 hover:text-violet-600 transition-colors"
            >
              CampusFlow
            </Link>
          </div>
          <div className="text-sm text-slate-600">
            {currentUser?.name} <span className="text-violet-600">({currentUser?.email})</span>
          </div>
        </div>
      </nav>

      {/* Overlay when sidebar is open (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Layout: sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - slides in on mobile, always visible on desktop */}
        <aside
          className={`fixed left-0 top-14 bottom-0 w-64 bg-white border-r border-slate-200 shadow-lg z-40 
            transform transition-transform duration-300 ease-in-out flex-shrink-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0 lg:static lg:top-0 lg:shadow-none`}
        >
          <div className="flex flex-col gap-2 p-4 h-full">
          {currentUser?.role === UserRole.STUDENT && navLink('/student', 'My Requests')}
          {currentUser?.role !== UserRole.STUDENT && (
            <>
              {navLink('/staff', 'Request Queue')}
              {navLink('/metrics', 'Metrics')}
            </>
          )}
          {navLink('/announcements', 'Announcements')}
          {navLink('/resources', 'Resources')}
          {navLink('/dates', 'Important Dates')}
          {navLink('/activity', 'Activity Feed')}
          {navLink('/directory', 'Directory')}
          {navLink('/profile', 'Profile')}
          {navLink('/settings', 'Settings')}
          <div className="flex-1" />
          <button
            onClick={() => { handleRoleSwitch(); closeSidebar(); }}
            className={`${BUTTON_CLASS} bg-teal-500 text-white hover:bg-teal-600 border-0`}
          >
            Switch to {getRoleDisplayName()}
          </button>
          <button
            onClick={() => { handleLogout(); closeSidebar(); }}
            className={`${BUTTON_CLASS} bg-rose-500 text-white hover:bg-rose-600 border-0`}
          >
            Logout
          </button>
          </div>
        </aside>
        {/* Main content */}
        <main className="flex-1 overflow-auto px-4 py-8 bg-slate-100">
          {children}
        </main>
      </div>
    </>
  );
}
