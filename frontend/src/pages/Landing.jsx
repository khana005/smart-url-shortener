import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiLink, FiBarChart2, FiLock, FiClock, FiShare2,
  FiZap, FiGlobe, FiShield, FiArrowRight, FiCheck,
  FiCopy, FiExternalLink,
} from 'react-icons/fi';
import Navbar from '../components/Navbar';

const features = [
  {
    icon: FiZap,
    title: 'Instant Shortening',
    desc: 'Generate short URLs in milliseconds with custom aliases and fast redirects.',
    color: 'text-amber-400 bg-amber-500/10',
  },
  {
    icon: FiBarChart2,
    title: 'Real-Time Analytics',
    desc: 'Track clicks, devices, countries, browsers, and referrers in real time.',
    color: 'text-primary-400 bg-primary-500/10',
  },
  {
    icon: FiLock,
    title: 'Password Protection',
    desc: 'Secure your links with password gates — passwords are always hashed.',
    color: 'text-rose-400 bg-rose-500/10',
  },
  {
    icon: FiClock,
    title: 'Link Expiration',
    desc: 'Set exact expiry dates for time-sensitive campaigns and limited offers.',
    color: 'text-cyan-400 bg-cyan-500/10',
  },
  {
    icon: FiShare2,
    title: 'QR Codes',
    desc: 'Auto-generate downloadable QR codes for every shortened URL.',
    color: 'text-emerald-400 bg-emerald-500/10',
  },
  {
    icon: FiShield,
    title: 'Secure & Private',
    desc: 'Rate limiting, helmet headers, hashed analytics — built security-first.',
    color: 'text-violet-400 bg-violet-500/10',
  },
];

const steps = [
  { step: '01', title: 'Paste your URL', desc: 'Enter any long URL into the shortener.' },
  { step: '02', title: 'Customize & create', desc: 'Add a custom alias, password, or expiry date.' },
  { step: '03', title: 'Share & track', desc: 'Share anywhere and watch analytics roll in.' },
];

const Landing = () => {
  const [demoUrl, setDemoUrl] = useState('');
  const [demoResult, setDemoResult] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);

  // Demo shortener — shows what the result looks like
  const handleDemo = (e) => {
    e.preventDefault();
    if (!demoUrl) return;
    setDemoLoading(true);
    setTimeout(() => {
      const code = Math.random().toString(36).slice(2, 9);
      setDemoResult({ shortUrl: `smurl.io/${code}`, original: demoUrl });
      setDemoLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-dark-400 bg-grid">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6">
            <FiZap className="text-xs" />
            Smart URL Shortener — Shorten, Track & Share
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            Shorten URLs.<br />
            <span className="text-gradient">Track Everything.</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create short, branded links with powerful analytics, QR codes, password protection,
            and expiration dates. Built for modern teams.
          </p>

          {/* Demo shortener */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleDemo} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <FiLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://your-long-url.com/paste-here"
                  className="input-field pl-10 text-base py-4 bg-dark-100/80"
                />
              </div>
              <button
                type="submit"
                disabled={demoLoading || !demoUrl}
                className="btn-primary px-8 py-4 text-base whitespace-nowrap flex items-center gap-2 glow-primary"
              >
                {demoLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiZap />
                )}
                Shorten Now
              </button>
            </form>

            {/* Demo result */}
            {demoResult && (
              <div className="mt-4 p-4 card bg-dark-100/80 flex items-center justify-between animate-slide-up">
                <div className="text-left">
                  <p className="text-xs text-slate-500 mb-0.5">Your short URL</p>
                  <p className="text-primary-400 font-mono font-semibold">{demoResult.shortUrl}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(`https://${demoResult.shortUrl}`)}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-all"
                    title="Copy"
                  >
                    <FiCopy className="text-sm" />
                  </button>
                  <Link to="/register" className="btn-primary text-xs py-2 px-3 flex items-center gap-1">
                    Save & Track <FiArrowRight className="text-xs" />
                  </Link>
                </div>
              </div>
            )}

            <p className="mt-4 text-sm text-slate-500">
              Free forever for basic use.{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 transition-colors">
                Sign up to save and track your links →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats strip ────────────────────────────────────────── */}
      <section className="border-y border-white/[0.04] bg-dark-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Links Created', value: '10M+' },
              { label: 'Clicks Tracked', value: '500M+' },
              { label: 'Active Users', value: '50K+' },
              { label: 'Uptime', value: '99.9%' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="text-sm text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything you need to <span className="text-gradient">manage links</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              A full-featured URL management platform designed for speed, analytics, and control.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card-hover p-6 group">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="text-xl" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-200/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-3">How it works</h2>
            <p className="text-slate-400">Get started in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector lines */}
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-gradient-to-r from-primary-500/30 to-cyan-500/30" />

            {steps.map(({ step, title, desc }) => (
              <div key={step} className="text-center relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-cyan-500/20 border border-primary-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-gradient">{step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card p-12 bg-gradient-to-br from-primary-500/10 to-cyan-500/5 border-primary-500/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-30" />
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to take control of your links?
              </h2>
              <p className="text-slate-400 mb-8">
                Join thousands of users tracking and managing their links with SmartURL.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary px-8 py-3.5 text-base flex items-center justify-center gap-2 glow-primary">
                  Get Started Free <FiArrowRight />
                </Link>
                <Link to="/login" className="btn-secondary px-8 py-3.5 text-base">
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.04] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-accent rounded-md flex items-center justify-center">
              <FiLink className="text-white text-xs" />
            </div>
            <span className="font-bold text-sm text-white">Smart<span className="text-gradient">URL</span></span>
          </div>
          <p className="text-xs text-slate-600">© 2024 SmartURL. Built with ❤️ using MERN Stack.</p>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link to="/login" className="hover:text-slate-300 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-slate-300 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
