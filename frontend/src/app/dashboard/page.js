'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { auctionAPI, bidAPI } from '@/services/api';
import { Gavel, Trophy, Heart, Zap, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import AuctionCard from '@/components/auction/AuctionCard';
import CountdownTimer from '@/components/shared/CountdownTimer';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="stat-card flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
      <Icon size={22} style={{ color }} />
    </div>
    <div>
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</p>
      <p className="text-white text-2xl font-bold mt-0.5">{value}</p>
    </div>
  </motion.div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [bidStats, setBidStats] = useState({ total: 0, won: 0, active: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, bRes] = await Promise.all([
          auctionAPI.getAll({ status: 'active', limit: 6, sort: 'endTime' }),
          bidAPI.getMyBids(),
        ]);
        setAuctions(aRes.data.auctions || []);
        setBidStats(bRes.data.stats || {});
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden p-8"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1a0533 100%)', border: '1px solid rgba(124,58,237,0.3)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #7C3AED, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-1/2 w-96 h-32 opacity-5"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
        <div className="relative">
          <span className="live-badge mb-3">🔴 Live Auctions Active</span>
          <h1 className="text-3xl font-bold text-white font-poppins mt-2">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-slate-400 mt-2 max-w-lg">
            Discover premium items up for bid right now. Real-time bidding, instant notifications, and secure transactions.
          </p>
          <div className="flex gap-3 mt-5">
            <Link href="/dashboard/auctions" className="btn-primary">
              <Gavel size={16} /> Browse Auctions
            </Link>
            <Link href="/dashboard/my-bids" className="btn-outline">
              My Bids <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Gavel} label="Total Bids" value={bidStats.total || 0} color="#3B82F6" delay={0.1} />
        <StatCard icon={Zap} label="Active Bids" value={bidStats.active || 0} color="#F59E0B" delay={0.15} />
        <StatCard icon={Trophy} label="Won" value={bidStats.won || 0} color="#10B981" delay={0.2} />
        <StatCard icon={Heart} label="Watchlist" value={user?.watchlist?.length || 0} color="#7C3AED" delay={0.25} />
      </div>

      {/* Live Auctions */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Live Auctions</h2>
            <span className="live-badge"><span className="live-dot" /> Live</span>
          </div>
          <Link href="/dashboard/auctions" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl animate-pulse" style={{ background: '#111827', height: 320 }} />
            ))}
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Gavel size={40} className="mx-auto mb-3 opacity-30" />
            <p>No active auctions right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {auctions.map((auction, i) => (
              <AuctionCard key={auction._id} auction={auction} delay={i * 0.1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
