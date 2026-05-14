'use client';
import { useEffect, useState } from 'react';
import { adminAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { Users, Ban, Trash2, Search } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const load = async (q = '') => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ search: q });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(() => load(search), 500); return () => clearTimeout(t); }, [search]);

  const toggleBan = async (id, name, isBanned) => {
    if (!confirm(`${isBanned ? 'Unban' : 'Ban'} user ${name}?`)) return;
    try {
      await adminAPI.banUser(id);
      setUsers(u => u.map(usr => usr._id === id ? { ...usr, isBanned: !usr.isBanned } : usr));
      toast.success(`User ${isBanned ? 'unbanned' : 'banned'}!`);
    } catch { toast.error('Action failed'); }
  };

  const deleteUser = async (id, name) => {
    if (!confirm(`Permanently delete user ${name}? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(u => u.filter(usr => usr._id !== id));
      toast.success('User deleted!');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Users size={24} className="text-blue-400" /> User Management</h1>
          <p className="text-slate-400 text-sm mt-1">{total} total users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by email..."
          className="input-field pl-9" />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(30,58,95,0.5)' }}>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-500">No users found</div>
        ) : (
          <table className="w-full data-table">
            <thead><tr>
              <th className="text-left">User</th>
              <th className="text-left">Gender / Age</th>
              <th className="text-left">Joined</th>
              <th className="text-left">Verified</th>
              <th className="text-left">Status</th>
              <th className="text-left">Actions</th>
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #3B82F620, #7C3AED20)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.3)' }}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{u.name}</p>
                        <p className="text-slate-500 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="text-slate-400 text-sm">{u.gender} / {u.age}</span></td>
                  <td><span className="text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</span></td>
                  <td>
                    {u.isVerified
                      ? <span className="badge badge-active">✓ Verified</span>
                      : <span className="badge badge-pending">Pending</span>}
                  </td>
                  <td>
                    {u.isBanned
                      ? <span className="badge badge-ended">Banned</span>
                      : <span className="badge badge-active">Active</span>}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleBan(u._id, u.name, u.isBanned)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-yellow-500/10" title={u.isBanned ? 'Unban' : 'Ban'}>
                        <Ban size={14} style={{ color: u.isBanned ? '#10B981' : '#F59E0B' }} />
                      </button>
                      <button onClick={() => deleteUser(u._id, u.name)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10" title="Delete">
                        <Trash2 size={14} style={{ color: '#EF4444' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
