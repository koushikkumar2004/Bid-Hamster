'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { auctionAPI } from '@/services/api';
import AuctionCard from '@/components/auction/AuctionCard';
import { Search, Filter, Gavel } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';

const CATEGORIES = ['All', 'Cars', 'Electronics', 'Fashion', 'Sports', 'Art', 'Collectibles', 'Other'];
const SORTS = [{ value: 'createdAt', label: 'Newest' }, { value: 'endTime', label: 'Ending Soon' }, { value: 'currentBid', label: 'Highest Bid' }, { value: 'totalBids', label: 'Most Bids' }];

export default function AuctionsPage() {
  const searchParams = useSearchParams();
  const { onEvent } = useSocket();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('createdAt');
  const [status, setStatus] = useState('active');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort, status };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      const res = await auctionAPI.getAll(params);
      setAuctions(res.data.auctions || []);
      setPagination(res.data.pagination || {});
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, sort, status, category]);
  useEffect(() => { const t = setTimeout(() => { setPage(1); load(); }, 500); return () => clearTimeout(t); }, [search]);
  
  useEffect(() => {
    const q = searchParams.get('search');
    if (q) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    return onEvent('auctionCreated', (newAuction) => {
      setAuctions(prev => [newAuction, ...prev]);
    });
  }, [onEvent]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Auctions</h1>
          <p className="text-slate-400 text-sm mt-1">{pagination.total || 0} auctions found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search auctions..."
            className="input-field pl-9 py-2" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="input-field py-2 w-auto" style={{ background: 'rgba(7,11,26,0.8)', color: '#E2E8F0' }}>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
          <option value="">All</option>
        </select>
        <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
          className="input-field py-2 w-auto" style={{ background: 'rgba(7,11,26,0.8)', color: '#E2E8F0' }}>
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => { setCategory(cat); setPage(1); }}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: category === cat ? 'linear-gradient(135deg, #3B82F6, #7C3AED)' : 'rgba(30,58,95,0.3)',
              color: category === cat ? 'white' : '#64748B',
              border: category === cat ? 'none' : '1px solid rgba(30,58,95,0.5)',
            }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(12)].map((_, i) => <div key={i} className="rounded-2xl animate-pulse" style={{ background: '#111827', height: 340 }} />)}
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Gavel size={48} className="mx-auto mb-4 opacity-30" />
          <h3 className="text-xl text-slate-400 font-semibold">No auctions found</h3>
          <p className="mt-1 text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {auctions.map((a, i) => <AuctionCard key={a._id} auction={a} delay={i * 0.05} />)}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {[...Array(pagination.pages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className="w-9 h-9 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: page === i + 1 ? 'linear-gradient(135deg, #3B82F6, #7C3AED)' : 'rgba(30,58,95,0.3)',
                color: page === i + 1 ? 'white' : '#64748B',
              }}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
