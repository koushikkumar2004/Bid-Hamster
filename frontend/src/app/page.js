'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Gavel, Shield, TrendingUp, Users, Clock, ArrowRight, CheckCircle } from 'lucide-react';

const FEATURES = [
  { icon: Zap, title: 'Real-Time Bidding', desc: 'Socket.IO powered live updates — see every bid the instant it happens.', color: '#3B82F6' },
  { icon: Shield, title: 'Secure & Verified', desc: 'JWT auth, email OTP verification, and bcrypt password protection.', color: '#7C3AED' },
  { icon: TrendingUp, title: 'Revenue Analytics', desc: 'Advanced dashboards for tracking bids, revenue, and auction performance.', color: '#10B981' },
  { icon: Gavel, title: 'Smart Auctions', desc: 'Multi-image listings, categories, bid increments, and auto-expiry.', color: '#F59E0B' },
  { icon: Users, title: 'User Management', desc: 'Admin controls to manage users, ban accounts, and moderate auctions.', color: '#EC4899' },
  { icon: Clock, title: 'Live Countdowns', desc: 'Real-time synchronized countdown timers across all connected devices.', color: '#06B6D4' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#070B1A' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border border-blue-400/20"
            style={{ background: 'linear-gradient(135deg, #3B82F610, #7C3AED10)' }}>
            <img src="/logo.png" alt="Bid Hamster" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-bold font-poppins text-white">Bid <span style={{ color: '#3B82F6' }}>Hamster</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-slate-400 hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Sign In</Link>
          <Link href="/auth/register" className="btn-primary text-sm py-2 px-5">Get Started →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-8 pt-20 pb-24 text-center overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 animate-float"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)', filter: 'blur(40px)' }} />
        <div className="absolute top-20 right-1/4 w-80 h-80 rounded-full opacity-8 animate-float"
          style={{ background: 'radial-gradient(circle, #7C3AED, transparent)', filter: 'blur(40px)', animationDelay: '3s' }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative">
          <span className="live-badge mb-6 inline-flex"><span className="live-dot" /> Platform Live</span>
          <h1 className="text-5xl md:text-7xl font-black text-white font-poppins leading-tight mb-6">
            Bid. Win. <span className="gradient-text">Triumph.</span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            The next-generation real-time auction platform. Place bids in milliseconds, receive instant confirmations, and win premium items.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/auth/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="btn-primary text-base px-8 py-4">
                <Gavel size={18} /> Start Bidding Free
              </motion.div>
            </Link>
            <Link href="/dashboard/auctions">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="btn-outline text-base px-8 py-4">
                Browse Auctions <ArrowRight size={16} />
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="border-y py-8" style={{ borderColor: 'rgba(30,58,95,0.5)', background: 'rgba(15,23,42,0.5)' }}>
        <div className="max-w-5xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '10K+', label: 'Active Users' },
            { value: '$2M+', label: 'Auction Volume' },
            { value: '500+', label: 'Auctions Won' },
            { value: '99.9%', label: 'Uptime' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-black gradient-text">{value}</p>
              <p className="text-slate-400 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white font-poppins">Everything You Need</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">A complete auction ecosystem built for speed, security, and scalability.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center"
              style={{ background: '#111827', border: `1px solid ${color}20` }}
              whileHover={{ boxShadow: `0 20px 60px ${color}15` }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon size={26} style={{ color }} />
              </div>
              <h3 className="text-white font-bold text-xl mb-3">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-8 pb-24">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="rounded-3xl p-12 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0F172A, #1a0533)', border: '1px solid rgba(124,58,237,0.4)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #7C3AED, transparent)', transform: 'translate(30%, -30%)' }} />
          <h2 className="text-4xl font-bold text-white font-poppins mb-4">Ready to Start Bidding?</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">Join thousands of users on Bid Hamster. Create your free account in seconds.</p>
          <div className="flex justify-center gap-4 flex-wrap mb-6">
            {['Free to join', 'Email verified', 'Instant invoices', 'Real-time updates'].map(f => (
              <span key={f} className="flex items-center gap-2 text-sm text-slate-300">
                <CheckCircle size={14} className="text-green-400" /> {f}
              </span>
            ))}
          </div>
          <Link href="/auth/register">
            <motion.div whileHover={{ scale: 1.05 }} className="inline-flex btn-primary text-base px-10 py-4">
              Create Free Account <ArrowRight size={16} />
            </motion.div>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center" style={{ borderColor: 'rgba(30,58,95,0.4)' }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border border-blue-400/20">
            <img src="/logo.png" alt="" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-white">Bid Hamster</span>
        </div>
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Bid Hamster. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/auth/login" className="text-slate-500 hover:text-slate-300 text-xs">Login</Link>
          <Link href="/auth/register" className="text-slate-500 hover:text-slate-300 text-xs">Register</Link>
          <Link href="/admin/login" className="text-slate-500 hover:text-slate-300 text-xs">Admin</Link>
        </div>
      </footer>
    </div>
  );
}
