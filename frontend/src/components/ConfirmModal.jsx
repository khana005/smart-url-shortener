import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmModal = ({ title, message, onConfirm, onCancel, confirmText = 'Delete', confirmClass = 'btn-danger', loading = false }) => {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-box max-w-sm">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiAlertTriangle className="text-red-400 text-lg" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
              <p className="text-sm text-slate-400">{message}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onCancel} className="btn-secondary flex-1 text-sm py-2.5">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`${confirmClass} flex-1 text-sm py-2.5 flex items-center justify-center gap-2`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
