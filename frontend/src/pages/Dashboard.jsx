import { useState, useEffect, useCallback } from 'react';
import { FiLink, FiBarChart2, FiUsers, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { getUserUrls } from '../api/urls';
import { getDashboardAnalytics } from '../api/analytics';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import LinkTable from '../components/LinkTable';
import CreateLinkModal from '../components/CreateLinkModal';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import toast from 'react-hot-toast';

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

const Dashboard = () => {
  const { user } = useAuth();
  const [urls, setUrls] = useState([]);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [urlsLoading, setUrlsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Pagination & filters
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTimer, setSearchTimer] = useState(null);

  const fetchUrls = useCallback(async (params = {}) => {
    setUrlsLoading(true);
    try {
      const { data } = await getUserUrls({
        page: params.page ?? page,
        limit: 10,
        search: params.search ?? search,
        sortBy: params.sortBy ?? sortBy,
        order: params.order ?? sortOrder,
        status: params.status ?? filterStatus,
      });
      setUrls(data.data.urls);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error('Failed to load links');
    } finally {
      setUrlsLoading(false);
    }
  }, [page, search, sortBy, sortOrder, filterStatus]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await getDashboardAnalytics();
      setStats(data.data);
    } catch {
      // Stats are non-critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUrls(); fetchStats(); }, []);

  // Debounce search
  const handleSearchChange = (val) => {
    setSearch(val);
    clearTimeout(searchTimer);
    const t = setTimeout(() => {
      setPage(1);
      fetchUrls({ page: 1, search: val });
    }, 400);
    setSearchTimer(t);
  };

  const handleFilterChange = (val) => {
    setFilterStatus(val);
    setPage(1);
    fetchUrls({ page: 1, status: val });
  };

  const handleSort = (field) => {
    const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
    setSortBy(field);
    setSortOrder(newOrder);
    fetchUrls({ sortBy: field, order: newOrder });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchUrls({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreated = (newUrl) => {
    setUrls((prev) => [newUrl, ...prev]);
    fetchStats();
  };

  const handleUrlsChange = (updater) => {
    setUrls(updater);
    fetchStats();
  };

  // Fill in empty days for the chart
  const chartData = (() => {
    if (!stats?.clicksOverTime?.length) return [];
    const map = {};
    stats.clicksOverTime.forEach((d) => { map[d.date] = d.clicks; });
    const days = 14;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key.slice(5), clicks: map[key] || 0 });
    }
    return result;
  })();

  return (
    <div className="min-h-screen bg-dark-400">
      <Navbar onCreateLink={() => setShowCreate(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage and track all your shortened links</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { fetchUrls(); fetchStats(); }}
              className="btn-ghost p-2.5 rounded-xl"
              title="Refresh"
            >
              <FiRefreshCw className="text-sm" />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <FiPlus /> New Link
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard title="Total Links" value={stats?.totalLinks ?? 0} icon={FiLink} color="primary" loading={statsLoading} />
          <StatsCard title="Total Clicks" value={stats?.totalClicks ?? 0} icon={FiBarChart2} color="cyan" loading={statsLoading} />
          <StatsCard title="Unique Visitors" value={stats?.totalUniqueVisitors ?? 0} icon={FiUsers} color="emerald" loading={statsLoading} />
        </div>

        {/* Clicks over time chart */}
        {!statsLoading && chartData.length > 0 && (
          <div className="card p-6">
            <h2 className="text-base font-semibold text-white mb-6">Clicks — Last 14 Days</h2>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="clicks" stroke="#6366f1" strokeWidth={2} fill="url(#clickGrad)" dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Links table */}
        <div>
          <h2 className="text-base font-semibold text-white mb-4">Your Links</h2>
          <LinkTable
            urls={urls}
            onUrlsChange={handleUrlsChange}
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
            loading={urlsLoading}
            searchValue={search}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            filterStatus={filterStatus}
            onCreateLink={() => setShowCreate(true)}
          />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-slate-500">
                Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}–
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} links
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
                >
                  ← Prev
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-8 h-8 text-xs rounded-lg transition-all ${
                      pagination.currentPage === i + 1
                        ? 'bg-primary-500 text-white'
                        : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showCreate && (
        <CreateLinkModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}
    </div>
  );
};

export default Dashboard;
