'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  LayoutDashboard, Gavel, Heart, Trophy, FileText, User, Settings,
  LogOut, Menu, X, Bell, Search, Zap, Wallet, ChevronDown, Plus, CreditCard, Building, Smartphone, Calendar
} from 'lucide-react';
import { walletAPI, notificationAPI } from '@/services/api';
import { useSocket } from '@/context/SocketContext';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/auctions', icon: Gavel, label: 'Live Auctions' },
  { href: '/dashboard/my-bids', icon: Zap, label: 'My Bids' },
  { href: '/dashboard/watchlist', icon: Heart, label: 'Watchlist' },
  { href: '/dashboard/won', icon: Trophy, label: 'Won Auctions' },
  { href: '/dashboard/invoices', icon: FileText, label: 'Invoices' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout({ children }) {
  const { user, loading, logout, updateUser } = useAuth();
  const { onEvent } = useSocket();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processingPayment, setProcessingPayment] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    // Allow admins to stay on user dashboard if they wish to view it
    if (!loading && user) fetchNotifications();
  }, [user, loading]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const markNotificationsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await notificationAPI.markRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
    } catch (err) {
      console.error('Failed to mark notifications read');
    }
  };

  useEffect(() => {
    if (!user) return;
    
    const cleanAuction = onEvent('auctionCreated', (auction) => {
      toast(`NEW LIVE AUCTION: ${auction.title}`, { icon: '🔥', duration: 5000 });
      // We don't necessarily re-fetch notifications here because newNotification will trigger it
    });

    const cleanNotif = onEvent('newNotification', (notif) => {
      setUnreadCount(prev => prev + 1);
      setNotifications(prev => [notif, ...prev].slice(0, 50));
      toast.success(notif.title);
    });

    return () => {
      cleanAuction?.();
      cleanNotif?.();
    };
  }, [user, onEvent]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) return toast.error('Enter a valid amount');
    setProcessingPayment(true);
    try {
      const { data } = await walletAPI.deposit({ amount: Number(depositAmount), currency: user.currency || 'INR', paymentMethod });
      const { transactionId } = data;
      // Process immediately (removed artificial 2s delay)
      try {
        const verifyRes = await walletAPI.verify({ transactionId, status: 'Success' });
        if (verifyRes.data.success) {
          toast.success('The amount was successfully added! ✅');
          updateUser(verifyRes.data.user);
          setDepositModalOpen(false);
          setDepositAmount('');
        }
      } catch (err) { 
        toast.error(err.response?.data?.message || 'Payment verification failed'); 
      } finally { 
        setProcessingPayment(false); 
      }
    } catch (err) {
      setProcessingPayment(false);
      toast.error(err.response?.data?.message || 'Failed to initiate deposit');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/auctions?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#070B1A' }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 animate-glow"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)' }}><Zap size={32} color="white" /></div>
        <p className="text-slate-400">Loading...</p>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#070B1A' }}>
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-64 flex-shrink-0 flex flex-col z-30"
            style={{ background: '#0F172A', borderRight: '1px solid rgba(30,58,95,0.6)' }}
          >
            {/* Logo */}
            <div className="p-6 border-b" style={{ borderColor: 'rgba(30,58,95,0.6)' }}>
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border border-blue-400/20"
                  style={{ background: 'linear-gradient(135deg, #3B82F610, #7C3AED10)' }}>
                  <img src="/logo.png" alt="Bid Hamster" className="w-full h-full object-cover" />
                </div>
                <span className="text-xl font-bold font-poppins text-white">
                  Bid <span style={{ color: '#3B82F6' }}>Hamster</span>
                </span>
              </Link>
            </div>
            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {NAV.map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href}
                  className={`sidebar-link ${pathname === href ? 'active' : ''}`}>
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            {/* User */}
            <div className="p-4 border-t" style={{ borderColor: 'rgba(30,58,95,0.6)' }}>
              <div className="flex items-center gap-3 mb-3 p-3 rounded-xl" style={{ background: 'rgba(7,11,26,0.5)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)', color: 'white' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{user.name}</p>
                  <p className="text-slate-400 text-xs truncate">{user.email}</p>
                </div>
              </div>
              <button onClick={logout}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium">
                <LogOut size={16} /> Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center gap-4 px-6 py-4 flex-shrink-0 relative z-40"
          style={{ background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(30,58,95,0.6)', backdropFilter: 'blur(12px)' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-slate-400 hover:text-white transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search auctions..." className="w-full pl-9 pr-4 py-2 text-sm rounded-lg outline-none"
              style={{ background: 'rgba(7,11,26,0.8)', border: '1px solid rgba(30,58,95,0.6)', color: '#E2E8F0' }} />
          </form>

          <div className="flex items-center gap-3 ml-auto">
            {/* Wallet */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-green-500/10 border border-green-500/30">
                <Wallet size={14} className="text-green-500" />
                <span className="text-green-400 font-bold">{formatCurrency(user.walletBalance || 0, user.currency || 'INR')}</span>
              </div>
              <button onClick={() => setDepositModalOpen(true)} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/20">
                <Plus size={14} /> Add Money
              </button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                  if (!notificationsOpen) markNotificationsRead();
                }}
                className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {notificationsOpen && (
                <div className="absolute right-0 top-12 w-80 rounded-2xl py-2 z-50 shadow-2xl overflow-hidden"
                  style={{ background: '#1a2035', border: '1px solid rgba(124,58,237,0.3)', backdropFilter: 'blur(10px)' }}>
                  <div className="px-4 py-3 border-b flex justify-between items-center" style={{ borderColor: 'rgba(124,58,237,0.2)' }}>
                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                    <span className="text-[10px] text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Live</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <Bell size={24} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} className={`px-4 py-3 border-b last:border-0 transition-colors hover:bg-white/5 ${!n.readStatus ? 'bg-blue-500/5' : ''}`} 
                          style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
                          <div className="flex gap-3">
                            <div className="mt-1">
                              {n.type === 'auction_created' ? <Zap size={14} className="text-yellow-400" /> : 
                               n.type === 'outbid' ? <Bell size={14} className="text-orange-400" /> :
                               <Bell size={14} className="text-blue-400" />}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white leading-snug">{n.title}</p>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
                                <Calendar size={10} />
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-colors relative">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)', color: 'white' }}>
                  {user.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : user.name?.charAt(0).toUpperCase()}
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-1 left-7 w-3 h-3 bg-green-500 border-2 border-[#0F172A] rounded-full"></div>
                <ChevronDown size={14} className="text-slate-400 ml-1" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-48 rounded-xl py-2 z-50"
                  style={{ background: '#1a2035', border: '1px solid rgba(30,58,95,0.8)' }}>
                  <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5">
                    <User size={14} /> Profile
                  </Link>
                  <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5">
                    <Settings size={14} /> Settings
                  </Link>
                  <div className="border-t my-1" style={{ borderColor: 'rgba(30,58,95,0.6)' }} />
                  <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        </main>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {depositModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-[#0F172A]">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Wallet className="text-blue-500" /> Add Money to Wallet</h2>
                <button onClick={() => !processingPayment && setDepositModalOpen(false)} className="text-slate-400 hover:text-white transition"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Amount ({user.currency || 'INR'})</label>
                  <input type="number" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} disabled={processingPayment} placeholder="Enter amount..." className="w-full bg-[#070B1A] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['UPI', 'Card', 'NetBanking', 'BankTransfer'].map(method => (
                      <button key={method} type="button" disabled={processingPayment} onClick={() => setPaymentMethod(method)} className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition ${paymentMethod === method ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-[#070B1A] border-slate-700 text-slate-300 hover:border-slate-500'}`}>
                        {method === 'UPI' ? <Smartphone size={16}/> : method === 'Card' ? <CreditCard size={16}/> : <Building size={16}/>}
                        {method === 'NetBanking' ? 'Net Banking' : method === 'BankTransfer' ? 'Bank Transfer' : method}
                      </button>
                    ))}
                  </div>
                </div>
                <button disabled={processingPayment || !depositAmount} onClick={handleDeposit} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden">
                  {processingPayment ? (
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing Payment...
                    </div>
                  ) : (
                    `Add ${depositAmount ? formatCurrency(depositAmount, user.currency || 'INR') : ''}`
                  )}
                </button>
                {processingPayment && <p className="text-xs text-center text-slate-400 animate-pulse">Please do not close this window or press back.</p>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
