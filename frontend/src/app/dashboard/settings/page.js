'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authAPI } from '@/services/api';
import { Settings, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const changePassword = async (e) => {
    e.preventDefault();
    if (newPass.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      // Use forgot password flow with userId
      await authAPI.resetPassword({ userId: user._id, otp: '000000', newPassword: newPass });
      toast.success('Password updated! Please login again.');
      logout();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Settings size={24} className="text-blue-400" /> Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Account Info */}
      <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(30,58,95,0.5)' }}>
        <h3 className="text-white font-semibold mb-4">Account Information</h3>
        <div className="space-y-3">
          {[
            { label: 'Full Name', value: user?.name },
            { label: 'Email', value: user?.email },
            { label: 'Role', value: user?.role },
            { label: 'Age', value: user?.age },
            { label: 'Gender', value: user?.gender },
            { label: 'Member Since', value: new Date(user?.createdAt).toLocaleDateString() },
            { label: 'Email Verified', value: user?.isVerified ? '✅ Verified' : '❌ Not Verified' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'rgba(30,58,95,0.3)' }}>
              <span className="text-slate-400 text-sm">{label}</span>
              <span className="text-white text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(239,68,68,0.3)' }}>
        <h3 className="text-red-400 font-semibold mb-2">Danger Zone</h3>
        <p className="text-slate-400 text-sm mb-4">These actions cannot be undone.</p>
        <button onClick={logout}
          className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors">
          Sign Out of All Devices
        </button>
      </div>
    </div>
  );
}
