const StatsCard = ({ title, value, icon: Icon, color = 'primary', change, loading }) => {
  const colorMap = {
    primary: {
      icon: 'text-primary-400 bg-primary-500/10',
      glow: 'hover:border-primary-500/20',
    },
    cyan: {
      icon: 'text-cyan-400 bg-cyan-500/10',
      glow: 'hover:border-cyan-500/20',
    },
    emerald: {
      icon: 'text-emerald-400 bg-emerald-500/10',
      glow: 'hover:border-emerald-500/20',
    },
    amber: {
      icon: 'text-amber-400 bg-amber-500/10',
      glow: 'hover:border-amber-500/20',
    },
  };

  const colors = colorMap[color] || colorMap.primary;

  if (loading) {
    return (
      <div className="stat-card animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-white/5" />
        <div className="h-4 bg-white/5 rounded w-24" />
        <div className="h-8 bg-white/5 rounded w-16" />
      </div>
    );
  }

  return (
    <div className={`stat-card transition-all duration-200 ${colors.glow} hover:shadow-lg hover:-translate-y-0.5`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.icon}`}>
        <Icon className="text-lg" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-white mt-0.5">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {change !== undefined && (
          <p className={`text-xs mt-1 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {change >= 0 ? '▲' : '▼'} {Math.abs(change)}% this month
          </p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
