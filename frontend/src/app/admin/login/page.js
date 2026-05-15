'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Shield, Mail, Lock } from 'lucide-react';
import { authAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.adminLogin({ email, password });
      login(res.data.user, res.data.token);
      toast.success('Welcome, Admin!');
      router.push('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid admin credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" 
      style={{ 
        backgroundImage: 'linear-gradient(rgba(7, 11, 26, 0.75), rgba(7, 11, 26, 0.95)), url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 rounded-full opacity-15 animate-float"
        style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden border border-purple-500/20"
              style={{ background: 'linear-gradient(135deg, #7C3AED10, #3B82F610)' }}>
              <img src="/logo.png" alt="Bid Hamster" className="w-full h-full object-cover" />
            </div>
            <span className="text-3xl font-bold font-poppins text-white">
              Bid <span style={{ color: '#7C3AED' }}>Hamster</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white font-poppins">Admin Portal</h1>
          <p className="text-slate-400 mt-2 text-sm">Authorized Personnel Only</p>
        </div>

        <div className="rounded-2xl p-8" style={{ background: '#111827', border: '1px solid rgba(124,58,237,0.4)' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Admin Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
                  placeholder="admin@example.com" className="input-field pl-9" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'}
                  required placeholder="••••••••" className="input-field pl-9 pr-9" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Authenticating...' : 'Access Admin Panel'}
            </motion.button>
          </form>
          <p className="text-center text-slate-500 text-xs mt-6">
            <Link href="/auth/login" className="text-slate-400 hover:text-white">← User Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
