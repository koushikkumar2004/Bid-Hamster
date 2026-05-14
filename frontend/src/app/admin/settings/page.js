'use client';
import { useAuth } from '@/context/AuthContext';
import { Settings, Shield } from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Settings size={24} className="text-purple-400" /> Admin Settings</h1>
      </div>
      <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(30,58,95,0.5)' }}>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Shield size={16} className="text-purple-400" /> Admin Account</h3>
        <div className="space-y-3">
          {[
            { label: 'Name', value: user?.name },
            { label: 'Email', value: user?.email },
            { label: 'Role', value: 'Administrator' },
            { label: 'Platform Fee', value: '5% per bid' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b" style={{ borderColor: 'rgba(30,58,95,0.3)' }}>
              <span className="text-slate-400 text-sm">{label}</span>
              <span className="text-white text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
