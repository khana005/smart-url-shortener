import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiLink, FiMenu, FiX, FiLogOut, FiUser, FiBarChart2, FiGrid } from 'react-icons/fi';

const Navbar = ({ onCreateLink }) => {
  const { isAuthenticated, user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 border-b border-white/[0.06] bg-dark-400/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent rounded-lg flex items-center justify-center glow-primary-sm group-hover:glow-primary transition-all duration-300">
              <FiLink className="text-white text-sm" />
            </div>
            <span className="font-bold text-lg text-white hidden sm:block">
              Smart<span className="text-gradient">URL</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/dashboard')
                      ? 'bg-primary-500/15 text-primary-400'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <FiGrid className="text-xs" />
                  Dashboard
                </Link>

                {onCreateLink && (
                  <button
                    onClick={onCreateLink}
                    className="ml-2 btn-primary text-sm py-2 px-4"
                  >
                    + New Link
                  </button>
                )}

                {/* Profile dropdown */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 group"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-accent rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-300 group-hover:text-slate-100 max-w-[100px] truncate">
                      {user?.name}
                    </span>
                    <svg className={`w-3 h-3 text-slate-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 card border-white/10 shadow-2xl overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/[0.06]">
                        <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                        >
                          <FiLogOut className="text-sm" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4 ml-1">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.06] bg-dark-400 p-4 space-y-2 animate-slide-up">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 p-3 card">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent rounded-full flex items-center justify-center font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 w-full px-4 py-3 text-sm text-slate-300 hover:bg-white/5 rounded-xl transition-all"
              >
                <FiGrid /> Dashboard
              </Link>
              {onCreateLink && (
                <button
                  onClick={() => { onCreateLink(); setMobileOpen(false); }}
                  className="w-full btn-primary text-sm"
                >
                  + New Link
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <FiLogOut /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="block w-full btn-secondary text-center text-sm">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block w-full btn-primary text-center text-sm">
                Get Started Free
              </Link>
            </>
          )}
        </div>
      )}

      {/* Close profile dropdown on outside click */}
      {profileOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setProfileOpen(false)} />
      )}
    </nav>
  );
};

export default Navbar;
