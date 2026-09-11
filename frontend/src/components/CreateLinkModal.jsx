import { useState } from 'react';
import { FiX, FiLink, FiLock, FiCalendar, FiTag, FiEye, FiEyeOff } from 'react-icons/fi';
import { createUrl } from '../api/urls';
import toast from 'react-hot-toast';

const CreateLinkModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    originalUrl: '',
    customAlias: '',
    title: '',
    password: '',
    expiresAt: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.originalUrl) errs.originalUrl = 'URL is required';
    else {
      try { new URL(form.originalUrl); } catch { errs.originalUrl = 'Please enter a valid URL (include https://)'; }
    }
    if (form.customAlias && !/^[a-zA-Z0-9_-]{3,30}$/.test(form.customAlias)) {
      errs.customAlias = 'Alias: 3-30 chars, letters, numbers, - or _';
    }
    if (form.password && form.password.length < 4) {
      errs.password = 'Password must be at least 4 characters';
    }
    if (form.expiresAt && new Date(form.expiresAt) <= new Date()) {
      errs.expiresAt = 'Expiration must be in the future';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        originalUrl: form.originalUrl,
        ...(form.customAlias && { customAlias: form.customAlias }),
        ...(form.title && { title: form.title }),
        ...(form.password && { password: form.password }),
        ...(form.expiresAt && { expiresAt: form.expiresAt }),
      };
      const { data } = await createUrl(payload);
      toast.success('Short link created!');
      onCreated(data.url);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create link';
      toast.error(msg);
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach((e) => { fieldErrors[e.field] = e.message; });
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  // Minimum datetime for expiry picker (now)
  const minDateTime = new Date().toISOString().slice(0, 16);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500/15 rounded-xl flex items-center justify-center">
              <FiLink className="text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Create Short Link</h2>
              <p className="text-xs text-slate-500">Shorten, protect, and track your URL</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-xl">
            <FiX />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Original URL */}
          <div>
            <label className="label">
              <FiLink className="inline mr-1.5 text-xs" />
              Destination URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              name="originalUrl"
              value={form.originalUrl}
              onChange={handleChange}
              placeholder="https://example.com/very/long/url"
              className={`input-field ${errors.originalUrl ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              autoFocus
            />
            {errors.originalUrl && <p className="text-red-400 text-xs mt-1">{errors.originalUrl}</p>}
          </div>

          {/* Title & Alias row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">
                <FiTag className="inline mr-1.5 text-xs" />
                Title (optional)
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="My awesome link"
                className="input-field"
                maxLength={100}
              />
            </div>
            <div>
              <label className="label">Custom Alias</label>
              <div className="flex items-center bg-dark-100 border border-white/10 rounded-xl overflow-hidden focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all">
                <span className="pl-3 text-xs text-slate-500 whitespace-nowrap">/</span>
                <input
                  name="customAlias"
                  value={form.customAlias}
                  onChange={handleChange}
                  placeholder="my-link"
                  className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 px-2 py-3 text-sm focus:outline-none"
                  maxLength={30}
                />
              </div>
              {errors.customAlias && <p className="text-red-400 text-xs mt-1">{errors.customAlias}</p>}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="label">
              <FiLock className="inline mr-1.5 text-xs" />
              Password Protection (optional)
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Leave blank for no password"
                className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Expiry */}
          <div>
            <label className="label">
              <FiCalendar className="inline mr-1.5 text-xs" />
              Expiration Date (optional)
            </label>
            <input
              type="datetime-local"
              name="expiresAt"
              value={form.expiresAt}
              onChange={handleChange}
              min={minDateTime}
              className={`input-field ${errors.expiresAt ? 'border-red-500' : ''}`}
              style={{ colorScheme: 'dark' }}
            />
            {errors.expiresAt && <p className="text-red-400 text-xs mt-1">{errors.expiresAt}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Link'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLinkModal;
