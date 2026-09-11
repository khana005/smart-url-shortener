import { Link } from 'react-router-dom';
import { FiLink, FiArrowLeft } from 'react-icons/fi';

const NotFound = () => (
  <div className="min-h-screen bg-dark-400 bg-grid flex flex-col items-center justify-center p-4">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

    <Link to="/" className="flex items-center gap-2 mb-10">
      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent rounded-lg flex items-center justify-center">
        <FiLink className="text-white text-sm" />
      </div>
      <span className="font-bold text-white">Smart<span className="text-gradient">URL</span></span>
    </Link>

    <div className="text-center relative animate-slide-up max-w-md">
      <p className="text-8xl font-black text-gradient mb-4 select-none">404</p>
      <h1 className="text-2xl font-bold text-white mb-3">Link Not Found</h1>
      <p className="text-slate-400 text-sm mb-8 leading-relaxed">
        This short link doesn't exist or may have been deleted by its owner.
        Double-check the URL and try again.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="btn-primary flex items-center justify-center gap-2 text-sm py-3 px-6">
          Go to Homepage
        </Link>
        <button onClick={() => window.history.back()} className="btn-secondary flex items-center justify-center gap-2 text-sm py-3 px-6">
          <FiArrowLeft className="text-sm" />
          Go Back
        </button>
      </div>
    </div>
  </div>
);

export default NotFound;
