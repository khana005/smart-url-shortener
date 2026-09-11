const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mb-4">
      <Icon className="text-3xl text-primary-400/60" />
    </div>
    <h3 className="text-lg font-semibold text-slate-300 mb-1.5">{title}</h3>
    <p className="text-sm text-slate-500 max-w-xs mb-6">{description}</p>
    {action && (
      <button onClick={action.onClick} className="btn-primary text-sm">
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
