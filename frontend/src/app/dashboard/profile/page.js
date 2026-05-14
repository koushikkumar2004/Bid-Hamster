'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { User, Phone, Camera, Globe, Coins } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [nationality, setNationality] = useState(user?.nationality || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('nationality', nationality);
      formData.append('currency', currency);
      if (currentPassword && newPassword) {
        formData.append('currentPassword', currentPassword);
        formData.append('newPassword', newPassword);
      }
      if (avatarFile) formData.append('avatar', avatarFile);
      const res = await authAPI.updateProfile(formData);
      updateUser(res.data.user);
      toast.success('Profile updated!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account information</p>
      </div>

      <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(30,58,95,0.5)' }}>
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #7C3AED)', color: 'white' }}>
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name?.charAt(0).toUpperCase()}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: '#3B82F6' }}>
              <Camera size={12} color="white" />
              <input type="file" className="hidden" accept="image/*" onChange={e => setAvatarFile(e.target.files[0])} />
            </label>
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{user?.name}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
              style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.3)' }}>
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={name} onChange={e => setName(e.target.value)} className="input-field pl-9" placeholder="Your name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field pl-9" placeholder="+1 234 567 8900" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Nationality</label>
              <div className="relative">
                <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={nationality} onChange={e => setNationality(e.target.value)} className="input-field pl-9" style={{ color: '#E2E8F0', background: 'rgba(7,11,26,0.8)' }}>
                  <option value="">Select Country</option>
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Japan">Japan</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Currency</label>
              <div className="relative">
                <Coins size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select value={currency} onChange={e => setCurrency(e.target.value)} className="input-field pl-9" style={{ color: '#E2E8F0', background: 'rgba(7,11,26,0.8)' }}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Read-only */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input value={user?.email || ''} readOnly className="input-field opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Gender</label>
              <input value={user?.gender || ''} readOnly className="input-field opacity-60 cursor-not-allowed" />
            </div>
          </div>

          {avatarFile && (
            <div className="p-3 rounded-xl text-sm text-blue-400" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}>
              📎 New avatar: {avatarFile.name}
            </div>
          )}

          {/* Password Change */}
          <div className="pt-4 border-t" style={{ borderColor: 'rgba(30,58,95,0.6)' }}>
            <h3 className="text-white font-semibold mb-4">Change Password</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input-field" placeholder="••••••••" style={{ background: 'rgba(7,11,26,0.8)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" placeholder="••••••••" style={{ background: 'rgba(7,11,26,0.8)' }} />
              </div>
            </div>
          </div>

          <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn-primary" style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
