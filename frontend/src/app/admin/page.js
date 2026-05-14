'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminAPI, auctionAPI, invoiceAPI } from '@/services/api';
import { Users, Gavel, TrendingUp, FileText, Zap, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StatCard = ({ icon: Icon, label, value, sub, color, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="stat-card" style={{ borderColor: `${color}20` }}>
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{sub}</span>
    </div>
    <p className="text-3xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    <p className="text-slate-400 text-sm mt-1">{label}</p>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3" style={{ background: '#1a2035', border: '1px solid rgba(30,58,95,0.8)' }}>
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      {payload.map(p => <p key={p.name} className="font-bold text-sm" style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? `₹${p.value.toFixed(2)}` : p.value}</p>)}
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(r => {
      setStats(r.data.stats);
      setCharts(r.data.charts || {});
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => <div key={i} className="rounded-2xl animate-pulse" style={{ background: '#111827', height: 140 }} />)}
    </div>
  );

  const revenueData = charts.revenueByDay?.map(d => ({ date: d._id, Revenue: d.revenue, Volume: d.volume })) || [];
  const usersData = charts.recentUsers?.map(d => ({ date: d._id, Users: d.count })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Platform overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers || 0} sub="Registered" color="#3B82F6" delay={0.05} />
        <StatCard icon={Gavel} label="Total Auctions" value={stats?.totalAuctions || 0} sub="All time" color="#7C3AED" delay={0.1} />
        <StatCard icon={Zap} label="Active Auctions" value={stats?.activeBids || 0} sub="Live now" color="#10B981" delay={0.15} />
        <StatCard icon={TrendingUp} label="Total Bids" value={stats?.totalBids || 0} sub="Placed" color="#F59E0B" delay={0.2} />
        <StatCard icon={BarChart3} label="Revenue" value={`₹${(stats?.totalRevenue || 0).toFixed(2)}`} sub="Platform fees" color="#EC4899" delay={0.25} />
        <StatCard icon={FileText} label="Bid Volume" value={`₹${(stats?.totalBidVolume || 0).toFixed(2)}`} sub="Total" color="#06B6D4" delay={0.3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="rounded-2xl p-5" style={{ background: '#111827', border: '1px solid rgba(30,58,95,0.5)' }}>
          <h3 className="text-white font-semibold mb-4">Revenue (Last 7 Days)</h3>
          {revenueData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.3)" />
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Revenue" stroke="#3B82F6" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="rounded-2xl p-5" style={{ background: '#111827', border: '1px solid rgba(30,58,95,0.5)' }}>
          <h3 className="text-white font-semibold mb-4">New Users (Last 7 Days)</h3>
          {usersData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={usersData}>
                <defs>
                  <linearGradient id="usrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.3)" />
                <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Users" stroke="#7C3AED" fill="url(#usrGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  );
}
