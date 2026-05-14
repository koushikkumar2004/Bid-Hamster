'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { bidAPI } from '@/services/api';
import CountdownTimer from '@/components/shared/CountdownTimer';
import { Gavel, TrendingUp, Trophy, XCircle } from 'lucide-react';

export default function MyBidsPage() {
  const [bids, setBids] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    bidAPI.getMyBids().then(r => { setBids(r.data.bids || []); setStats(r.data.stats || {}); }).finally(() => setLoading(false));
  }, []);

  const filtered = bids.filter(b => {
    if (filter === 'active') return b.auctionId?.status === 'active';
    if (filter === 'won') return b.isWinningBid;
    if (filter === 'lost') return b.auctionId?.status === 'ended' && !b.isWinningBid;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Bids</h1>
        <p className="text-slate-400 text-sm mt-1">Track all your bidding activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bids', value: stats.total || 0, icon: Gavel, color: '#3B82F6' },
          { label: 'Active', value: stats.active || 0, icon: TrendingUp, color: '#F59E0B' },
          { label: 'Won', value: stats.won || 0, icon: Trophy, color: '#10B981' },
          { label: 'Lost', value: stats.lost || 0, icon: XCircle, color: '#EF4444' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}15` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div><p className="text-slate-400 text-xs">{label}</p><p className="text-white font-bold text-xl">{value}</p></div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'active', 'won', 'lost'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all"
            style={{
              background: filter === f ? 'linear-gradient(135deg, #3B82F6, #7C3AED)' : 'rgba(30,58,95,0.3)',
              color: filter === f ? 'white' : '#64748B',
            }}>{f}</button>
        ))}
      </div>

      {/* Bids Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(30,58,95,0.5)' }}>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Gavel size={40} className="mx-auto mb-3 opacity-30 text-slate-500" />
            <p className="text-slate-400">No bids found</p>
          </div>
        ) : (
          <table className="w-full data-table">
            <thead><tr>
              <th className="text-left">Item</th>
              <th className="text-left">Your Bid</th>
              <th className="text-left">Current Bid</th>
              <th className="text-left">Status</th>
              <th className="text-left">Time Left</th>
              <th className="text-left">Action</th>
            </tr></thead>
            <tbody>
              {filtered.map((bid) => {
                const a = bid.auctionId;
                const isWinning = a?.status === 'active' && a?.currentBid === bid.amount;
                return (
                  <tr key={bid._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {a?.images?.[0]?.url && (
                          <img src={a.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="text-white font-medium text-sm line-clamp-1">{a?.title || 'Deleted'}</p>
                          <p className="text-slate-500 text-xs">{a?.category}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="text-white font-semibold">₹{bid.amount?.toFixed(2)}</span></td>
                    <td><span style={{ color: '#10B981' }} className="font-semibold">₹{a?.currentBid?.toFixed(2) || '-'}</span></td>
                    <td>
                      {a?.status === 'active' && isWinning && <span className="badge badge-active">Highest</span>}
                      {a?.status === 'active' && !isWinning && <span className="badge badge-pending">Outbid</span>}
                      {bid.isWinningBid && <span className="badge badge-won">Won 🏆</span>}
                      {a?.status === 'ended' && !bid.isWinningBid && <span className="badge badge-ended">Lost</span>}
                    </td>
                    <td>{a?.status === 'active' ? <CountdownTimer endTime={a.endTime} compact /> : <span className="text-slate-500 text-xs">–</span>}</td>
                    <td>
                      {a && <Link href={`/dashboard/auctions/${a._id}`} className="text-blue-400 hover:text-blue-300 text-xs font-medium">View →</Link>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
