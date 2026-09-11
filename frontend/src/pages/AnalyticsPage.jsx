import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiExternalLink, FiCopy, FiLock, FiClock,
  FiBarChart2, FiUsers, FiGlobe, FiSmartphone, FiMonitor,
} from 'react-icons/fi';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import { getUrlAnalytics } from '../api/analytics';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-dark-100 border border-white/10 rounded-xl px-4 py-2.5 shadow-xl text-sm">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-white font-semibold">{payload[0].value} clicks</p>
      </div>
    );
  }
  return null;
};

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#f1f5f9" textAnchor="middle" dominantBaseline="central" fontSize={11}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const BreakdownList = ({ data, title, icon: Icon }) => (
  <div className="card p-5">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="text-primary-400" />
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
    {data?.length ? (
      <div className="space-y-2.5">
        {data.map((item, i) => {
          const total = data.reduce((s, d) => s + d.value, 0);
          const pct = total ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.name || i}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 truncate capitalize">{item.name || 'Unknown'}</span>
                <span className="text-slate-400 ml-2 flex-shrink-0">{item.value} ({pct}%)</span>
              </div>
              <div className="h-1.5 bg-dark-300 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: COLORS[i % COLORS.length],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    ) : (
      <p className="text-slate-500 text-xs text-center py-4">No data yet</p>
    )}
  </div>
);

const AnalyticsPage = () => {
  const { urlId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getUrlAnalytics(urlId, days);
        setData(res.data.data);
      } catch (err) {
        toast.error('Failed to load analytics');
        if (err.response?.status === 404) navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [urlId, days]);

  const handleCopy = () => {
    if (data?.url?.shortUrl) {
      navigator.clipboard.writeText(data.url.shortUrl);
      toast.success('Copied!');
    }
  };

  // Fill chart with empty days
  const chartData = (() => {
    if (!data?.clicksOverTime) return [];
    const map = {};
    data.clicksOverTime.forEach((d) => { map[d.date] = d.clicks; });
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key.slice(5), clicks: map[key] || 0 });
    }
    return result;
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-400">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <LoadingSpinner size="lg" text="Loading analytics..." />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { url, totalClicks, uniqueVisitors, deviceBreakdown, browserBreakdown, osBreakdown, topReferrers, topCountries, recentClicks } = data;

  return (
    <div className="min-h-screen bg-dark-400">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <button onClick={() => navigate('/dashboard')} className="btn-ghost p-2 mt-0.5">
            <FiArrowLeft />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-white truncate">
                {url.title || `/${url.shortCode}`}
              </h1>
              {url.isPasswordProtected && (
                <span className="badge-protected flex items-center gap-1"><FiLock className="text-xs" />Protected</span>
              )}
              {url.status === 'expired' && <span className="badge-expired">Expired</span>}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a href={url.shortUrl} target="_blank" rel="noreferrer"
                className="text-primary-400 text-sm hover:text-primary-300 transition-colors font-mono flex items-center gap-1">
                {url.shortUrl} <FiExternalLink className="text-xs" />
              </a>
              <button onClick={handleCopy} className="text-slate-500 hover:text-slate-300 transition-colors">
                <FiCopy className="text-sm" />
              </button>
              <span className="text-slate-600 text-xs">→</span>
              <span className="text-slate-500 text-xs truncate max-w-xs">{url.originalUrl}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  days === d ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Clicks', value: totalClicks, icon: FiBarChart2, color: 'text-primary-400' },
            { label: 'Unique Visitors', value: uniqueVisitors, icon: FiUsers, color: 'text-cyan-400' },
            { label: 'Top Country', value: topCountries?.[0]?.name || '—', icon: FiGlobe, color: 'text-emerald-400' },
            { label: 'Top Device', value: deviceBreakdown?.[0]?.name || '—', icon: FiMonitor, color: 'text-amber-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`text-sm ${color}`} />
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
              </div>
              <p className="text-2xl font-bold text-white capitalize">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            </div>
          ))}
        </div>

        {/* Clicks over time */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-white mb-6">Clicks Over Time ({days} days)</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} fill="url(#analyticsGrad)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
              No click data for this period
            </div>
          )}
        </div>

        {/* Breakdowns row */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Device pie */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <FiSmartphone className="text-primary-400" /> Devices
            </h3>
            {deviceBreakdown?.length ? (
              <div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={deviceBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                      dataKey="value" labelLine={false} label={CustomPieLabel}>
                      {deviceBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [v, 'Clicks']} contentStyle={{ background: '#13141a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {deviceBreakdown.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="capitalize">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <p className="text-slate-500 text-xs text-center py-8">No data yet</p>}
          </div>

          <BreakdownList data={browserBreakdown} title="Browsers" icon={FiGlobe} />
          <BreakdownList data={osBreakdown} title="Operating Systems" icon={FiMonitor} />
        </div>

        {/* Referrers & Countries */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Referrers bar */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Top Referrers</h3>
            {topReferrers?.length ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={topReferrers.slice(0, 6)} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="referrer" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip contentStyle={{ background: '#13141a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-slate-500 text-xs text-center py-8">No referrer data yet</p>}
          </div>

          {/* Countries */}
          <BreakdownList data={topCountries?.map(c => ({ ...c, value: c.value })) || []} title="Top Countries" icon={FiGlobe} />
        </div>

        {/* Recent clicks */}
        {recentClicks?.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white">Recent Clicks</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.04]">
                    {['Time', 'Device', 'Browser', 'OS', 'Country', 'Referrer'].map((h) => (
                      <th key={h} className="table-header px-4 py-3 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {recentClicks.map((click, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="table-cell text-xs">
                        {new Date(click.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="table-cell text-xs capitalize">{click.device}</td>
                      <td className="table-cell text-xs">{click.browser}</td>
                      <td className="table-cell text-xs">{click.os}</td>
                      <td className="table-cell text-xs">{click.country}</td>
                      <td className="table-cell text-xs">{click.referrer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalyticsPage;
