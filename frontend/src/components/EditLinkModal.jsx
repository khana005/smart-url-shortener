import { useState } from 'react';
import { FiX, FiLock, FiCalendar, FiTag, FiEye, FiEyeOff } from 'react-icons/fi';
import { updateUrl } from '../api/urls';
import toast from 'react-hot-toast';

const EditLinkModal = ({ url, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    title: url.title || '',
    password: '',
    removePassword: false,
    expiresAt: url.expiresAt ? new Date(url.expiresAt).toISOString().slice(0, 16) : '',
    removeExpiry: false,
    isActive: url.isActive !== false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (form.password && form.password.length < 4) {
      errs.password = 'Password must be at least 4 characters';
    }
    if (form.expiresAt && !form.removeExpiry && new Date(form.expiresAt) <= new Date()) {
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
        title: form.title,
        isActive: form.isActive,
      };

      // Password handling
      if (form.removePassword) {
        payload.password = null;
      } else if (form.password) {
        payload.password = form.password;
      }

      // Expiry handling
      if (form.removeExpiry) {
        payload.expiresAt = null;
      } else if (form.expiresAt) {
        payload.expiresAt = form.expiresAt;
      }

      const { data } = await updateUrl(url.id || url._id, payload);
      toast.success('Link updated successfully!');
      onUpdated(data.url);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update link');
    } finally {
      setLoading(false);
    }
  };

  const minDateTime = new Date().toISOString().slice(0, 16);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box max-w-lg">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-semibold text-white">Edit Link</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-mono truncate max-w-xs">/{url.shortCode}</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-xl"><FiX /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="label"><FiTag className="inline mr-1.5 text-xs" />Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Link title"
              className="input-field"
              maxLength={100}
            />
          </div>

          {/* Status toggle */}
          <div className="flex items-center justify-between p-4 bg-dark-100 rounded-xl border border-white/[0.06]">
            <div>
              <p className="text-sm font-medium text-slate-200">Link Status</p>
              <p className="text-xs text-slate-500">Inactive links won't redirect</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                form.isActive ? 'bg-primary-500' : 'bg-slate-700'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                form.isActive ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Password */}
          <div>
            <label className="label"><FiLock className="inline mr-1.5 text-xs" />Password Protection</label>
            {url.isPasswordProtected && (
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="removePassword"
                  checked={form.removePassword}
                  onChange={handleChange}
                  className="rounded border-slate-600 bg-dark-100 text-primary-500"
                />
                <span className="text-xs text-slate-400">Remove existing password protection</span>
              </label>
            )}
            {!form.removePassword && (
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder={url.isPasswordProtected ? 'Enter new password to change' : 'Leave blank for no password'}
                  className={`input-field pr-10 ${errors.password ? 'border-red-500' : ''}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {showPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
            )}
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Expiry */}
          <div>
            <label className="label"><FiCalendar className="inline mr-1.5 text-xs" />Expiration Date</label>
            {url.expiresAt && (
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="removeExpiry"
                  checked={form.removeExpiry}
                  onChange={handleChange}
                  className="rounded border-slate-600 bg-dark-100 text-primary-500"
                />
                <span className="text-xs text-slate-400">Remove expiration (make permanent)</span>
              </label>
            )}
            {!form.removeExpiry && (
              <input
                type="datetime-local"
                name="expiresAt"
                value={form.expiresAt}
                onChange={handleChange}
                min={minDateTime}
                className={`input-field ${errors.expiresAt ? 'border-red-500' : ''}`}
                style={{ colorScheme: 'dark' }}
              />
            )}
            {errors.expiresAt && <p className="text-red-400 text-xs mt-1">{errors.expiresAt}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : null}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLinkModal;
