import { Link, useSearchParams } from 'react-router-dom';
import { FiClock, FiLink, FiArrowLeft } from 'react-icons/fi';

const ExpiredPage = () => {
  const [params] = useSearchParams();
  const code = params.get('code');

  return (
    <div className="min-h-screen bg-dark-400 bg-grid flex flex-col items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <Link to="/" className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent rounded-lg flex items-center justify-center">
          <FiLink className="text-white text-sm" />
        </div>
        <span className="font-bold text-white">Smart<span className="text-gradient">URL</span></span>
      </Link>

      <div className="card p-10 max-w-sm w-full text-center relative animate-slide-up">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <FiClock className="text-red-400 text-3xl" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Link Expired</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-2">
          This link has expired and is no longer accessible.
        </p>

        {code && (
          <div className="my-4 px-3 py-1.5 bg-dark-100 rounded-lg inline-block">
            <span className="text-xs font-mono text-slate-500">/{code}</span>
          </div>
        )}

        <p className="text-slate-500 text-xs mb-8">
          Contact the link owner if you believe this is an error.
        </p>

        <div className="flex flex-col gap-2.5">
          <Link to="/" className="btn-primary flex items-center justify-center gap-2 text-sm py-3">
            Create Your Own Short Link
          </Link>
          <button onClick={() => window.history.back()} className="btn-ghost text-sm py-2 flex items-center justify-center gap-2">
            <FiArrowLeft className="text-sm" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpiredPage;
