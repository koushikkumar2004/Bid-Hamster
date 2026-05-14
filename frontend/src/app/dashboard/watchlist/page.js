'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { auctionAPI, authAPI } from '@/services/api';
import AuctionCard from '@/components/auction/AuctionCard';
import { Heart } from 'lucide-react';

export default function WatchlistPage() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.getMe().then(r => {
      setWatchlist(r.data.user?.watchlist || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Heart size={24} className="text-red-400" /> Watchlist</h1>
        <p className="text-slate-400 text-sm mt-1">{watchlist.length} items watched</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="rounded-2xl animate-pulse" style={{ background: '#111827', height: 320 }} />)}
        </div>
      ) : watchlist.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Heart size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-xl text-slate-400">Your watchlist is empty</p>
          <p className="text-sm mt-1">Click the heart icon on any auction to add it</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {watchlist.map((a, i) => <AuctionCard key={a._id || a} auction={typeof a === 'object' ? a : { _id: a }} delay={i * 0.1} />)}
        </div>
      )}
    </div>
  );
}
