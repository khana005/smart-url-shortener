import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCopy, FiTrash2, FiEdit2, FiBarChart2, FiShare2,
  FiLock, FiClock, FiExternalLink, FiChevronUp, FiChevronDown,
  FiSearch, FiFilter, FiLink, FiCheck,
} from 'react-icons/fi';
import { deleteUrl } from '../api/urls';
import toast from 'react-hot-toast';
import QRModal from './QRModal';
import ShareModal from './ShareModal';
import EditLinkModal from './EditLinkModal';
import ConfirmModal from './ConfirmModal';
import EmptyState from './EmptyState';

const StatusBadge = ({ status }) => {
  const map = {
    active: <span className="badge-active">● Active</span>,
    expired: <span className="badge-expired">✕ Expired</span>,
    inactive: <span className="badge-inactive">○ Inactive</span>,
  };
  return map[status] || <span className="badge-inactive">{status}</span>;
};

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied!', { duration: 1500 });
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} title="Copy short URL"
      className={`p-1.5 rounded-lg text-xs transition-all duration-200 ${copied ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}>
      {copied ? <FiCheck /> : <FiCopy />}
    </button>
  );
};

const LinkTable = ({ urls, onUrlsChange, onSort, sortBy, sortOrder, loading, searchValue, onSearchChange, onFilterChange, filterStatus, onCreateLink }) => {
  const navigate = useNavigate();
  const [qrUrl, setQrUrl] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);
  const [editUrl, setEditUrl] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSort = (field) => {
    onSort(field);
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <FiChevronUp className="text-slate-600 opacity-0 group-hover:opacity-100" />;
    return sortOrder === 'asc'
      ? <FiChevronUp className="text-primary-400" />
      : <FiChevronDown className="text-primary-400" />;
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteUrl(deleteTarget.id || deleteTarget._id);
      toast.success('Link deleted.');
      onUrlsChange((prev) => prev.filter((u) => (u.id || u._id) !== (deleteTarget.id || deleteTarget._id)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleUpdated = (updated) => {
    onUrlsChange((prev) =>
      prev.map((u) => ((u.id || u._id) === (updated.id || updated._id) ? { ...u, ...updated } : u))
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const truncateUrl = (url, max = 45) =>
    url?.length > max ? url.slice(0, max) + '…' : url;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
          <input
            type="text"
            placeholder="Search links..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field pl-9 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange(e.target.value)}
            className="input-field text-sm w-auto min-w-[130px]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="table-header px-4 py-3.5 text-left">
                  <button onClick={() => handleSort('title')} className="flex items-center gap-1 group hover:text-slate-200 transition-colors">
                    Link <SortIcon field="title" />
                  </button>
                </th>
                <th className="table-header px-4 py-3.5 text-left hidden lg:table-cell">Status</th>
                <th className="table-header px-4 py-3.5 text-left hidden md:table-cell">
                  <button onClick={() => handleSort('clicks')} className="flex items-center gap-1 group hover:text-slate-200 transition-colors">
                    Clicks <SortIcon field="clicks" />
                  </button>
                </th>
                <th className="table-header px-4 py-3.5 text-left hidden xl:table-cell">
                  <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 group hover:text-slate-200 transition-colors">
                    Created <SortIcon field="createdAt" />
                  </button>
                </th>
                <th className="table-header px-4 py-3.5 text-left hidden xl:table-cell">Expires</th>
                <th className="table-header px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-4">
                        <div className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : urls.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <EmptyState
                      icon={FiLink}
                      title="No links found"
                      description={searchValue || filterStatus ? 'Try adjusting your filters.' : "You haven't created any short links yet."}
                      action={!searchValue && !filterStatus ? { label: '+ Create your first link', onClick: onCreateLink } : null}
                    />
                  </td>
                </tr>
              ) : (
                urls.map((url) => (
                  <tr key={url.id || url._id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Link info */}
                    <td className="table-cell max-w-xs">
                      <div className="space-y-1">
                        {url.title && (
                          <p className="text-sm font-medium text-slate-200 truncate">{url.title}</p>
                        )}
                        <div className="flex items-center gap-1">
                          <a
                            href={url.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-400 hover:text-primary-300 text-sm font-mono transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            /{url.shortCode}
                          </a>
                          <CopyButton text={url.shortUrl} />
                          {url.isPasswordProtected && (
                            <span title="Password protected" className="text-amber-400 text-xs"><FiLock /></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate max-w-xs" title={url.originalUrl}>
                          {truncateUrl(url.originalUrl)}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="table-cell hidden lg:table-cell">
                      <StatusBadge status={url.status || (url.isActive ? 'active' : 'inactive')} />
                    </td>

                    {/* Clicks */}
                    <td className="table-cell hidden md:table-cell">
                      <div>
                        <span className="font-semibold text-slate-100">{(url.clicks || 0).toLocaleString()}</span>
                        <span className="text-xs text-slate-500 ml-1">clicks</span>
                        <p className="text-xs text-slate-500">{(url.uniqueVisitors || 0).toLocaleString()} unique</p>
                      </div>
                    </td>

                    {/* Created */}
                    <td className="table-cell text-slate-400 text-xs hidden xl:table-cell">
                      {formatDate(url.createdAt)}
                    </td>

                    {/* Expires */}
                    <td className="table-cell hidden xl:table-cell">
                      {url.expiresAt ? (
                        <div className="flex items-center gap-1 text-xs">
                          <FiClock className={`${new Date(url.expiresAt) < new Date() ? 'text-red-400' : 'text-slate-500'}`} />
                          <span className={new Date(url.expiresAt) < new Date() ? 'text-red-400' : 'text-slate-400'}>
                            {formatDate(url.expiresAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600">Never</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/analytics/${url.id || url._id}`)}
                          title="Analytics"
                          className="p-1.5 text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all duration-200"
                        >
                          <FiBarChart2 className="text-sm" />
                        </button>
                        <button
                          onClick={() => setQrUrl(url)}
                          title="QR Code"
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-all duration-200 text-sm"
                        >
                          ▣
                        </button>
                        <button
                          onClick={() => setShareUrl(url)}
                          title="Share"
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200"
                        >
                          <FiShare2 className="text-sm" />
                        </button>
                        <button
                          onClick={() => setEditUrl(url)}
                          title="Edit"
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all duration-200"
                        >
                          <FiEdit2 className="text-sm" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(url)}
                          title="Delete"
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {qrUrl && <QRModal url={qrUrl} onClose={() => setQrUrl(null)} />}
      {shareUrl && <ShareModal url={shareUrl} onClose={() => setShareUrl(null)} />}
      {editUrl && <EditLinkModal url={editUrl} onClose={() => setEditUrl(null)} onUpdated={handleUpdated} />}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Link"
          message={`This will permanently delete "/${deleteTarget.shortCode}" and all its analytics. This action cannot be undone.`}
          confirmText="Delete Link"
          confirmClass="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 flex-1 text-sm"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default LinkTable;
