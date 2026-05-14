'use client';
import { useEffect, useState } from 'react';
import { auctionAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { Gavel, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import CountdownTimer from '@/components/shared/CountdownTimer';

export default function AdminAuctionsPage() {
  const [auctions, setAuctions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auctionAPI.adminGetAll().then(r => {
      setAuctions(r.data.auctions || []);
      setStats(r.data.stats || {});
    }).finally(() => setLoading(false));
  }, []);

  const update = async (id, data, msg) => {
    try {
      const res = await auctionAPI.adminUpdate(id, data);
      setAuctions(a => a.map(x => x._id === id ? res.data.auction : x));
      toast.success(msg);
    } catch { toast.error('Action failed'); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this auction? All bids will be removed.')) return;
    try {
      await auctionAPI.delete(id);
      setAuctions(a => a.filter(x => x._id !== id));
      toast.success('Auction deleted');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Gavel size={24} className="text-purple-400" /> Auction Management</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total || 0, color: '#3B82F6' },
          { label: 'Active', value: stats.active || 0, color: '#10B981' },
          { label: 'Ended', value: stats.ended || 0, color: '#64748B' },
          { label: 'Pending', value: stats.pending || 0, color: '#F59E0B' },
        ].map(s => (
          <div key={s.label} className="stat-card text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-slate-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(30,58,95,0.5)' }}>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : (
          <table className="w-full data-table">
            <thead><tr>
              <th className="text-left">Auction</th>
              <th className="text-left">Seller</th>
              <th className="text-left">Bids</th>
              <th className="text-left">Current Bid</th>
              <th className="text-left">Status</th>
              <th className="text-left">Ends</th>
              <th className="text-left">Actions</th>
            </tr></thead>
            <tbody>
              {auctions.map(a => (
                <tr key={a._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {a.images?.[0]?.url && <img src={a.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                      <div>
                        <p className="text-white font-medium text-sm line-clamp-1">{a.title}</p>
                        <p className="text-slate-500 text-xs">{a.category}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="text-slate-400 text-sm">{a.seller?.name}</span></td>
                  <td><span className="text-white font-semibold">{a.totalBids}</span></td>
                  <td><span style={{ color: '#10B981' }} className="font-semibold">${(a.currentBid || a.startingBid).toFixed(2)}</span></td>
                  <td>
                    <span className={`badge ${a.status === 'active' ? 'badge-active' : a.status === 'ended' ? 'badge-ended' : 'badge-pending'}`}>{a.status}</span>
                  </td>
                  <td>{a.status === 'active' ? <CountdownTimer endTime={a.endTime} compact /> : <span className="text-slate-500 text-xs">–</span>}</td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => update(a._id, { featured: !a.featured }, a.featured ? 'Unfeatured' : 'Featured!')} title="Toggle featured"
                        className="p-1.5 rounded-lg hover:bg-yellow-500/10 transition-colors">
                        <Star size={13} fill={a.featured ? '#F59E0B' : 'none'} color={a.featured ? '#F59E0B' : '#64748B'} />
                      </button>
                      {a.status === 'active' && (
                        <button onClick={() => update(a._id, { status: 'ended' }, 'Auction ended')} title="End auction"
                          className="p-1.5 rounded-lg hover:bg-orange-500/10 transition-colors">
                          <EyeOff size={13} className="text-orange-400" />
                        </button>
                      )}
                      <button onClick={() => remove(a._id)} title="Delete"
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                        <Trash2 size={13} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
