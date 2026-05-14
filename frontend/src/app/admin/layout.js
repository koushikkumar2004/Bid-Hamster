'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, Users, Gavel, FileText, TrendingUp, Settings, LogOut, Menu, X, Zap, Shield, BarChart3 } from 'lucide-react';

const NAV = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/auctions/create', icon: Zap, label: 'Create Auction' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/auctions', icon: Gavel, label: 'Auctions' },
  { href: '/admin/invoices', icon: FileText, label: 'Invoices' },
  { href: '/admin/revenue', icon: BarChart3, label: 'Revenue' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && pathname !== '/admin/login' && (!user || user.role !== 'admin')) {
      router.push('/admin/login');
    }
  }, [user, loading, pathname]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#070B1A' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center animate-glow"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)' }}>
        <Shield size={24} color="white" />
      </div>
    </div>
  );

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#070B1A' }}>
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }}
            className="w-64 flex-shrink-0 flex flex-col z-30"
            style={{ background: '#0F172A', borderRight: '1px solid rgba(124,58,237,0.3)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'rgba(124,58,237,0.3)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border border-purple-400/20"
                  style={{ background: 'linear-gradient(135deg, #7C3AED10, #3B82F610)' }}>
                  <img src="/logo.png" alt="Bid Hamster" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white font-poppins">Bid Hamster</span>
                  <p className="text-[10px] text-purple-400 font-bold tracking-widest uppercase mt-0.5">Admin Portal</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {NAV.map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href}
                  className={`sidebar-link ${pathname === href ? 'active' : ''}`}
                  style={pathname === href ? { color: '#7C3AED', borderLeftColor: '#7C3AED', background: 'rgba(124,58,237,0.1)' } : {}}>
                  <Icon size={18} /><span>{label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t" style={{ borderColor: 'rgba(124,58,237,0.3)' }}>
              <div className="p-3 rounded-xl mb-3" style={{ background: 'rgba(7,11,26,0.5)' }}>
                <p className="text-white text-sm font-medium">{user.name}</p>
                <p className="text-purple-400 text-xs">{user.email}</p>
              </div>
              <button onClick={logout} className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-4 px-6 py-4 flex-shrink-0"
          style={{ background: 'rgba(15,23,42,0.9)', borderBottom: '1px solid rgba(124,58,237,0.3)', backdropFilter: 'blur(12px)' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="text-slate-300 font-medium text-sm">Admin Dashboard</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="live-badge text-xs" style={{ background: 'rgba(124,58,237,0.15)', color: '#7C3AED', borderColor: 'rgba(124,58,237,0.4)' }}>
              <Shield size={10} /> ADMIN
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
