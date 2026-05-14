'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Eye, TrendingUp } from 'lucide-react';
import CountdownTimer from '@/components/shared/CountdownTimer';
import { auctionAPI } from '@/services/api';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  Cars: '#3B82F6', Electronics: '#7C3AED', Fashion: '#EC4899',
  Sports: '#10B981', Art: '#F59E0B', Collectibles: '#EF4444', Other: '#64748B',
};

export default function AuctionCard({ auction, delay = 0 }) {
  const [watched, setWatched] = useState(false);
  const [loadingWatch, setLoadingWatch] = useState(false);
  const img = auction.images?.[0]?.url || 'https://via.placeholder.com/400x300/111827/3B82F6?text=No+Image';
  const catColor = CATEGORY_COLORS[auction.category] || '#64748B';

  const toggleWatch = async (e) => {
    e.preventDefault();
    setLoadingWatch(true);
    try {
      await auctionAPI.toggleWatchlist(auction._id);
      setWatched(!watched);
      toast.success(watched ? 'Removed from watchlist' : 'Added to watchlist!');
    } catch { toast.error('Please login to use watchlist'); }
    setLoadingWatch(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="auction-card rounded-2xl overflow-hidden"
      style={{ background: '#111827', border: '1px solid rgba(30,58,95,0.5)' }}
    >
      <Link href={`/dashboard/auctions/${auction._id}`}>
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img src={img} alt={auction.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(7,11,26,0.9) 100%)' }} />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {auction.status === 'active' && (
              <span className="live-badge text-xs px-2 py-0.5"><span className="live-dot" /> LIVE</span>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${catColor}20`, color: catColor, border: `1px solid ${catColor}40` }}>
              {auction.category}
            </span>
          </div>

          {/* Watch button */}
          <button onClick={toggleWatch} disabled={loadingWatch}
            className="absolute top-3 right-3 p-2 rounded-full transition-all hover:scale-110"
            style={{ background: 'rgba(7,11,26,0.8)', border: '1px solid rgba(30,58,95,0.8)' }}>
            <Heart size={14} fill={watched ? '#EF4444' : 'none'} color={watched ? '#EF4444' : '#94A3B8'} />
          </button>

          {/* Timer */}
          {auction.status === 'active' && (
            <div className="absolute bottom-3 left-3">
              <CountdownTimer endTime={auction.endTime} compact />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-1">{auction.title}</h3>
          <p className="text-slate-500 text-xs mb-3">by {auction.seller?.name || 'Unknown'}</p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs">Current Bid</p>
              <p className="text-xl font-bold" style={{ color: '#10B981' }}>
                ₹{(auction.currentBid > 0 ? auction.currentBid : auction.startingBid).toFixed(2)}
              </p>
              {auction.currentBid === 0 && <p className="text-slate-500 text-xs">Starting price</p>}
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-xs flex items-center gap-1 justify-end">
                <TrendingUp size={12} /> {auction.totalBids} bids
              </p>
              <p className="text-slate-500 text-xs flex items-center gap-1 justify-end mt-0.5">
                <Eye size={12} /> {auction.views} views
              </p>
            </div>
          </div>

          {auction.status === 'active' && (
            <div className="mt-3 w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #3B82F620, #7C3AED20)', border: '1px solid rgba(59,130,246,0.3)', color: '#3B82F6' }}>
              Place Bid →
            </div>
          )}
          {auction.status === 'ended' && (
            <div className="mt-3 w-full text-center py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(100,116,139,0.1)', color: '#64748B' }}>
              Auction Ended
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
