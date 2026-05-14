'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { RefreshCw, Mail } from 'lucide-react';
import { authAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

function VerifyContent() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = useRef([]);
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const userId = params.get('userId');

  useEffect(() => { if (!userId) router.push('/auth/register'); }, [userId]);
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const n = [...otp]; n[idx] = val.slice(-1); setOtp(n);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (n.every(d => d !== '')) verify(n.join(''));
  };

  const handleKey = (idx, e) => { if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus(); };

  const verify = async (code) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await authAPI.verifyEmail({ userId, otp: code });
      login(res.data.user, res.data.token);
      toast.success('Email verified! Welcome 🎉');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const resend = async () => {
    try {
      await authAPI.resendOTP({ userId });
      toast.success('New OTP sent!');
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err) { toast.error('Failed to resend'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#070B1A' }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
            <Mail size={36} color="#3B82F6" />
          </div>
          <h1 className="text-3xl font-bold text-white">Check Your Email</h1>
          <p className="text-slate-400 mt-2 text-sm">Enter the 6-digit OTP we sent you</p>
        </div>
        <div className="glass rounded-2xl p-8">
          <div className="flex gap-3 justify-center mb-8">
            {otp.map((d, i) => (
              <input key={i} ref={el => inputRefs.current[i] = el} value={d}
                onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKey(i, e)}
                maxLength={1} className="w-12 h-14 text-center text-xl font-bold rounded-xl outline-none transition-all"
                style={{ background: 'rgba(7,11,26,0.9)', border: d ? '2px solid #3B82F6' : '1px solid rgba(30,58,95,0.8)', color: '#E2E8F0' }} />
            ))}
          </div>
          <motion.button onClick={() => verify(otp.join(''))} disabled={loading || otp.some(d => !d)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full btn-primary justify-center"
            style={{ opacity: (loading || otp.some(d => !d)) ? 0.5 : 1 }}>
            {loading ? 'Verifying...' : 'Verify Email'}
          </motion.button>
          <div className="text-center mt-6">
            {resendCooldown > 0
              ? <p className="text-slate-400 text-sm">Resend in <span className="text-blue-400 font-bold">{resendCooldown}s</span></p>
              : <button onClick={resend} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mx-auto"><RefreshCw size={14} />Resend OTP</button>}
          </div>
          <p className="text-center text-slate-500 text-sm mt-4"><Link href="/auth/login" className="text-slate-400 hover:text-white">← Back to Login</Link></p>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<div className="min-h-screen bg-bg flex items-center justify-center text-white">Loading...</div>}><VerifyContent /></Suspense>;
}
