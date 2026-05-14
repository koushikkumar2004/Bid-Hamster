'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';
import { authAPI } from '@/services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const router = useRouter();

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword({ email });
      setUserId(res.data.userId);
      setSent(true);
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword({ userId, otp, newPassword });
      toast.success('Password reset! Please login.');
      router.push('/auth/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#070B1A' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Reset Password</h1>
          <p className="text-slate-400 mt-2 text-sm">{sent ? 'Enter the OTP and your new password' : 'Enter your email to receive a reset OTP'}</p>
        </div>
        <div className="glass rounded-2xl p-8">
          {!sent ? (
            <form onSubmit={sendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="you@example.com" className="input-field pl-10" />
                </div>
              </div>
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full btn-primary justify-center" style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Sending...' : 'Send Reset OTP'}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Enter OTP</label>
                <input value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} placeholder="123456"
                  className="input-field text-center text-xl tracking-widest font-bold" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <input value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password"
                  placeholder="Min 6 characters" className="input-field" required />
              </div>
              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full btn-primary justify-center" style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </motion.button>
            </form>
          )}
          <p className="text-center text-slate-400 text-sm mt-6">
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">← Back to Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
