'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { auctionAPI } from '@/services/api';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import CountdownTimer from '@/components/shared/CountdownTimer';
import { TrendingUp, Users, Eye, Gavel, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function AuctionDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { joinAuction, leaveAuction, placeBid, onEvent } = useSocket();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await auctionAPI.getOne(id);
        setAuction(res.data.auction);
        setBids(res.data.bids || []);
        const minBid = res.data.auction.currentBid > 0
          ? res.data.auction.currentBid + res.data.auction.bidIncrement
          : res.data.auction.startingBid;
        setBidAmount(minBid.toString());
      } catch { toast.error('Failed to load auction'); }
      setLoading(false);
    };
    load();
    joinAuction(id);

    const cleanNewBid = onEvent('newBid', ({ bid, currentBid, totalBids }) => {
      setBids(prev => [bid, ...prev.slice(0, 19)]);
      setAuction(prev => prev ? { ...prev, currentBid, totalBids } : prev);
      setBidAmount((currentBid + 1).toString());
      toast.success('New bid placed!');
    });
    const cleanEnded = onEvent('auctionEnded', ({ winner }) => {
      setAuction(prev => prev ? { ...prev, status: 'ended', winner } : prev);
      toast('Auction has ended!', { icon: '🔔' });
    });

    return () => { leaveAuction(id); cleanNewBid?.(); cleanEnded?.(); };
  }, [id]);

  const handleBid = () => {
    const amount = parseFloat(bidAmount);
    const minBid = auction.currentBid > 0 ? auction.currentBid + auction.bidIncrement : auction.startingBid;
    if (!amount || amount < minBid) {
      toast.error(`Minimum bid is ₹${minBid.toFixed(2)}`);
      return;
    }
    setBidding(true);
    placeBid(id, amount);

    const cleanSuccess = onEvent('bidSuccess', ({ message, newBalance }) => {
      if (newBalance !== undefined) updateUser({ ...user, walletBalance: newBalance });
      toast.success(message || 'Bid placed! Check email for invoice.');
      setBidding(false); cleanSuccess?.();
    });
    const cleanError = onEvent('bidError', ({ message }) => {
      toast.error(message); setBidding(false); cleanError?.();
    });
    setTimeout(() => setBidding(false), 5000);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
    </div>
  );
  if (!auction) return <div className="text-center py-20 text-slate-400">Auction not found.</div>;

  const minBid = auction.currentBid > 0 ? auction.currentBid + auction.bidIncrement : auction.startingBid;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/auctions" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
        <ChevronLeft size={16} /> Back to Auctions
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Images + Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Image */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(30,58,95,0.5)' }}>
            <div className="relative h-80 md:h-96">
              <img src={auction.images?.[activeImg]?.url || 'https://via.placeholder.com/800x500/111827/3B82F6?text=No+Image'}
                alt={auction.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 flex gap-2">
                {auction.status === 'active' && <span className="live-badge"><span className="live-dot" /> LIVE</span>}
                <span className="badge badge-active">{auction.category}</span>
              </div>
            </div>
            {/* Thumbnails */}
            {auction.images?.length > 1 && (
              <div className="flex gap-2 p-4">
                {auction.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 transition-all"
                    style={{ border: activeImg === i ? '2px solid #3B82F6' : '2px solid transparent' }}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(30,58,95,0.5)' }}>
            <h1 className="text-2xl font-bold text-white mb-2">{auction.title}</h1>
            <p className="text-slate-400 text-sm mb-4">by <span className="text-blue-400">{auction.seller?.name}</span></p>
            <p className="text-slate-400 text-sm leading-relaxed">{auction.description}</p>
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[{ icon: TrendingUp, label: 'Total Bids', value: auction.totalBids }, { icon: Eye, label: 'Views', value: auction.views }, { icon: Users, label: 'Watchers', value: auction.watchers?.length || 0 }].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center p-3 rounded-xl" style={{ background: 'rgba(7,11,26,0.5)' }}>
                  <Icon size={18} className="mx-auto mb-1 text-blue-400" />
                  <p className="text-white font-bold">{value}</p>
                  <p className="text-slate-500 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bid History */}
          <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(30,58,95,0.5)' }}>
            <h3 className="text-white font-semibold mb-4">Bid History</h3>
            {bids.length === 0 ? <p className="text-slate-500 text-sm">No bids yet. Be the first!</p> : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {bids.map((bid, i) => (
                  <div key={bid._id} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: i === 0 ? 'rgba(16,185,129,0.1)' : 'rgba(7,11,26,0.5)', border: i === 0 ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: i === 0 ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)', color: i === 0 ? '#10B981' : '#3B82F6' }}>
                        {bid.bidder?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{bid.bidder?.name || 'Anonymous'}</p>
                        <p className="text-slate-500 text-xs">{new Date(bid.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <span className="font-bold" style={{ color: i === 0 ? '#10B981' : '#E2E8F0' }}>₹{bid.amount?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Bid Panel */}
        <div className="space-y-4">
          <div className="rounded-2xl p-6 sticky top-4" style={{ background: '#111827', border: '1px solid rgba(59,130,246,0.3)' }}>
            <div className="mb-4">
              <p className="text-slate-400 text-sm">Current Bid</p>
              <p className="text-4xl font-bold" style={{ color: '#10B981' }}>
                ₹{(auction.currentBid > 0 ? auction.currentBid : auction.startingBid).toFixed(2)}
              </p>
              {auction.currentBid === 0 && <p className="text-slate-500 text-xs mt-1">Starting price</p>}
            </div>

            {auction.status === 'active' && (
              <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(7,11,26,0.7)' }}>
                <p className="text-slate-400 text-xs mb-1">Time Remaining</p>
                <CountdownTimer endTime={auction.endTime} />
              </div>
            )}

            {auction.status === 'active' && user && auction.seller?._id !== user._id ? (
              <div className="space-y-3">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Your Bid (min ₹{minBid.toFixed(2)})</label>
                  <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} min={minBid} step="0.01"
                    className="input-field text-xl font-bold text-center" style={{ color: '#10B981' }} />
                </div>
                <motion.button onClick={handleBid} disabled={bidding} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary justify-center text-base py-3" style={{ opacity: bidding ? 0.7 : 1 }}>
                  {bidding ? 'Placing Bid...' : <><Gavel size={18} /> Place Bid</>}
                </motion.button>
                <p className="text-slate-500 text-xs text-center">Invoice + email confirmation on every bid</p>
              </div>
            ) : auction.status === 'ended' ? (
              <div className="text-center py-4">
                <p className="text-slate-400 text-sm">This auction has ended</p>
                {auction.winner && <p className="text-green-400 font-semibold mt-1">Winner: {auction.winner.name}</p>}
              </div>
            ) : !user ? (
              <Link href="/auth/login" className="w-full btn-primary justify-center text-center block">Login to Bid</Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
