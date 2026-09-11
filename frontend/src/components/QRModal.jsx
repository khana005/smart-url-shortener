import { useState, useEffect } from 'react';
import { FiX, FiDownload, FiCopy, FiShare2 } from 'react-icons/fi';
import { getQRCode } from '../api/urls';
import toast from 'react-hot-toast';
import LoadingSpinner from './LoadingSpinner';

const QRModal = ({ url, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState(url.qrCode || null);
  const [loading, setLoading] = useState(!url.qrCode);

  useEffect(() => {
    if (!qrDataUrl && url.id) {
      setLoading(true);
      getQRCode(url.id)
        .then(({ data }) => setQrDataUrl(data.qrCode))
        .catch(() => toast.error('Failed to load QR code'))
        .finally(() => setLoading(false));
    }
  }, [url.id]);

  const handleDownload = async () => {
    try {
      // Get PNG buffer from backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || '/api'}/urls/${url.id}/qr?format=png`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `qr-${url.shortCode}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('QR code downloaded!');
    } catch {
      // Fallback: download from data URL
      if (qrDataUrl) {
        const link = document.createElement('a');
        link.href = qrDataUrl;
        link.download = `qr-${url.shortCode}.png`;
        link.click();
      }
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url.shortUrl);
    toast.success('Short URL copied!');
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-sm">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <h2 className="text-lg font-semibold text-white">QR Code</h2>
          <button onClick={onClose} className="btn-ghost p-2 rounded-xl">
            <FiX />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* QR Code Image */}
          <div className="flex items-center justify-center bg-white rounded-2xl p-5 mx-auto w-fit shadow-inner">
            {loading ? (
              <div className="w-48 h-48 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-sm">
                Failed to load
              </div>
            )}
          </div>

          {/* URL info */}
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-primary-400">{url.shortUrl}</p>
            <p className="text-xs text-slate-500 truncate max-w-full">{url.originalUrl}</p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownload}
              disabled={loading || !qrDataUrl}
              className="btn-primary flex items-center justify-center gap-2 text-sm"
            >
              <FiDownload />
              Download PNG
            </button>
            <button
              onClick={handleCopyUrl}
              className="btn-secondary flex items-center justify-center gap-2 text-sm"
            >
              <FiCopy />
              Copy URL
            </button>
          </div>

          {/* Social share note */}
          <p className="text-center text-xs text-slate-500">
            QR code redirects to your shortened URL
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRModal;
