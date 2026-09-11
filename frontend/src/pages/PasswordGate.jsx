import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiLink, FiAlertCircle } from 'react-icons/fi';
import { verifyPassword } from '../api/urls';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const PasswordGate = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return setError('Please enter the password');
    if (attempts >= 5) return setError('Too many attempts. Please wait and try again.');

    setLoading(true);
    setError('');

    try {
      const { data } = await verifyPassword(shortCode, password);
      if (data.success) {
        toast.success('Access granted!', { duration: 1500 });
        setTimeout(() => {
          window.location.href = data.originalUrl;
        }, 500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Incorrect password';
      setError(msg);
      setAttempts((a) => a + 1);
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-400 bg-grid flex flex-col items-center justify-center p-4">
      {/* Top link */}
      <Link to="/" className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent rounded-lg flex items-center justify-center">
          <FiLink className="text-white text-sm" />
        </div>
        <span className="font-bold text-white">Smart<span className="text-gradient">URL</span></span>
      </Link>

      <div className="w-full max-w-sm">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="card p-8 relative animate-slide-up">
          <div className="text-center mb-7">
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiLock className="text-amber-400 text-2xl" />
            </div>
            <h1 className="text-xl font-bold text-white">Protected Link</h1>
            <p className="text-slate-400 text-sm mt-1">
              This link requires a password to access.
            </p>
            <div className="mt-2 px-3 py-1 bg-dark-100 rounded-lg inline-block">
              <span className="text-xs font-mono text-slate-500">/{shortCode}</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4 text-sm text-red-400 animate-fade-in">
              <FiAlertCircle className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {attempts >= 5 ? (
            <div className="text-center py-4">
              <p className="text-slate-400 text-sm mb-4">
                Too many failed attempts. Please try again later or contact the link owner.
              </p>
              <Link to="/" className="btn-secondary text-sm">Go Home</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter link password"
                    className={`input-field pl-9 pr-10 ${error ? 'border-red-500' : ''}`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                  </button>
                </div>
                {attempts > 0 && attempts < 5 && (
                  <p className="text-xs text-amber-500 mt-1">{5 - attempts} attempts remaining</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !password.trim()}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />Verifying...</>
                ) : (
                  'Access Link'
                )}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-600 mt-5">
            Don't know the password? Contact the link owner.
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          Powered by <Link to="/" className="text-primary-500 hover:text-primary-400">SmartURL</Link>
        </p>
      </div>
    </div>
  );
};

export default PasswordGate;
