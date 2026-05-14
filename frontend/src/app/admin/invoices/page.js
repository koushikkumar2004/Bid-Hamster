'use client';
import { useEffect, useState } from 'react';
import { invoiceAPI } from '@/services/api';
import { FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoiceAPI.adminGetAll().then(r => { setInvoices(r.data.invoices || []); setStats(r.data.stats || {}); }).finally(() => setLoading(false));
  }, []);

  const download = async (id, invId) => {
    try {
      const res = await invoiceAPI.download(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `invoice_${invId}.pdf`; a.click();
    } catch { toast.error('Download failed'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FileText size={24} className="text-blue-400" /> Invoice Management</h1>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Invoices', value: stats.count || 0, color: '#3B82F6' },
          { label: 'Platform Revenue', value: `₹${(stats.totalRevenue || 0).toFixed(2)}`, color: '#10B981' },
          { label: 'Total Bid Volume', value: `₹${(stats.totalBidVolume || 0).toFixed(2)}`, color: '#7C3AED' },
        ].map(s => (
          <div key={s.label} className="stat-card text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-slate-400 text-sm">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(30,58,95,0.5)' }}>
        {loading ? <div className="p-8 text-center text-slate-400">Loading...</div> : (
          <table className="w-full data-table">
            <thead><tr>
              <th className="text-left">Invoice ID</th>
              <th className="text-left">User</th>
              <th className="text-left">Item</th>
              <th className="text-left">Bid</th>
              <th className="text-left">Fee</th>
              <th className="text-left">Total</th>
              <th className="text-left">Status</th>
              <th className="text-left">Date</th>
              <th className="text-left">PDF</th>
            </tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv._id}>
                  <td><span className="font-mono text-xs text-blue-400">{inv.invoiceId}</span></td>
                  <td><span className="text-white text-sm">{inv.user?.name}</span></td>
                  <td><span className="text-slate-400 text-sm line-clamp-1">{inv.auction?.title}</span></td>
                  <td><span className="text-white font-semibold">₹{inv.amount?.toFixed(2)}</span></td>
                  <td><span className="text-yellow-400">₹{inv.platformFee?.toFixed(2)}</span></td>
                  <td><span className="text-green-400 font-bold">₹{inv.totalAmount?.toFixed(2)}</span></td>
                  <td><span className={`badge ${inv.status === 'paid' ? 'badge-active' : 'badge-pending'}`}>{inv.status}</span></td>
                  <td><span className="text-slate-500 text-xs">{new Date(inv.createdAt).toLocaleDateString()}</span></td>
                  <td>
                    <button onClick={() => download(inv._id, inv.invoiceId)} className="text-blue-400 hover:text-blue-300">
                      <Download size={14} />
                    </button>
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
