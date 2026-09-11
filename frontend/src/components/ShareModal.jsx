import { useState } from 'react';
import { FiX, FiCopy, FiTwitter, FiFacebook, FiLinkedin, FiMail, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ShareModal = ({ url, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url.shortUrl);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url.shortUrl)}&text=${encodeURIComponent(url.title || 'Check this out!')}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url.shortUrl)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url.shortUrl)}&title=${encodeURIComponent(url.title || '')}`,
    email: `mailto:?subject=${encodeURIComponent(url.title || 'Check this out!')}&body=${encodeURIComponent(`I wanted to share this link with you:\n\n${url.shortUrl}`)}`,
  };

  const shareButtons = [
    { label: 'Twitter / X', icon: FiTwitter, color: 'text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/20', url: shareVia.twitter },
    { label: 'Facebook', icon: FiFacebook, color: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20', url: shareVia.facebook },
    { label: 'LinkedIn', icon: FiLinkedin, color: 'text-blue-300 bg-blue-400/10 hover:bg-blue-400/20 border-blue-400/20', url: shareVia.linkedin },
    { label: 'Email', icon: FiMail, color: 'text-slate-300 bg-slate-500/10 hover:bg-slate-500/20 border-slate-500/20', url: shareVia.email },
  ];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white">Share Link</h2>
          <button onClick={onClose} className="btn-ghost p-2 rounded-xl"><FiX /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Copy box */}
          <div>
            <label className="label">Short URL</label>
            <div className="flex items-center gap-2 bg-dark-100 border border-white/10 rounded-xl p-1 pl-4">
              <span className="text-sm text-primary-400 flex-1 truncate">{url.shortUrl}</span>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                }`}
              >
                {copied ? <FiCheck className="text-xs" /> : <FiCopy className="text-xs" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Share buttons */}
          <div>
            <label className="label">Share via</label>
            <div className="grid grid-cols-2 gap-2.5">
              {shareButtons.map(({ label, icon: Icon, color, url: shareUrl }) => (
                <a
                  key={label}
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${color}`}
                >
                  <Icon className="text-base flex-shrink-0" />
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Original URL */}
          <div className="p-3 bg-dark-100 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Redirects to</p>
            <p className="text-xs text-slate-400 truncate">{url.originalUrl}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
