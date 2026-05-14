'use client';
import { useEffect, useState } from 'react';
import { bidAPI } from '@/services/api';
import AuctionCard from '@/components/auction/AuctionCard';
import { Trophy } from 'lucide-react';

export default function WonAuctionsPage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bidAPI.getWon().then(r => setAuctions(r.data.auctions || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Trophy className="text-yellow-400" size={24} /> Won Auctions</h1>
        <p className="text-slate-400 text-sm mt-1">{auctions.length} auctions won</p>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="rounded-2xl animate-pulse" style={{ background: '#111827', height: 320 }} />)}
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Trophy size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-xl text-slate-400">No auctions won yet</p>
          <p className="text-sm mt-1">Start bidding to win!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {auctions.map((a, i) => <AuctionCard key={a._id} auction={a} delay={i * 0.1} />)}
        </div>
      )}
    </div>
  );
}
