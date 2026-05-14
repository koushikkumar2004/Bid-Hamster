'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '@/services/api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3" style={{ background: '#1a2035', border: '1px solid rgba(30,58,95,0.8)' }}>
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }} className="text-sm font-bold">{p.name}: ₹{Number(p.value).toFixed(2)}</p>)}
    </div>
  );
};

export default function AdminRevenuePage() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(r => {
      setStats(r.data.stats || {});
      const rev = r.data.charts?.revenueByDay || [];
      setData(rev.map(d => ({ date: d._id, Revenue: d.revenue, Volume: d.volume })));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><TrendingUp size={24} className="text-green-400" /> Revenue Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Platform financial overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Total Platform Revenue', value: `₹${(stats.totalRevenue || 0).toFixed(2)}`, desc: '5% fee on all bids', color: '#10B981' },
          { label: 'Total Bid Volume', value: `₹${(stats.totalBidVolume || 0).toFixed(2)}`, desc: 'Across all auctions', color: '#3B82F6' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <DollarSign size={24} style={{ color: s.color }} className="mb-2" />
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-white font-medium mt-1">{s.label}</p>
            <p className="text-slate-500 text-sm">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Revenue vs Volume Chart */}
      <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(30,58,95,0.5)' }}>
        <h3 className="text-white font-semibold mb-4">Revenue vs Bid Volume (Last 7 Days)</h3>
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500">No data available yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.3)" />
              <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12 }} />
              <Bar dataKey="Volume" fill="#3B82F640" stroke="#3B82F6" strokeWidth={1} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Revenue" fill="#10B98140" stroke="#10B981" strokeWidth={1} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
