'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { invoiceAPI } from '@/services/api';
import { FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoiceAPI.getMyInvoices().then(r => setInvoices(r.data.invoices || [])).finally(() => setLoading(false));
  }, []);

  const download = async (id, invoiceId) => {
    try {
      const res = await invoiceAPI.download(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `invoice_${invoiceId}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded!');
    } catch { toast.error('Download failed'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FileText size={24} className="text-blue-400" /> My Invoices</h1>
        <p className="text-slate-400 text-sm mt-1">{invoices.length} invoices total</p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(30,58,95,0.5)' }}>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={40} className="mx-auto mb-3 opacity-30 text-slate-500" />
            <p className="text-slate-400">No invoices yet</p>
          </div>
        ) : (
          <table className="w-full data-table">
            <thead><tr>
              <th className="text-left">Invoice ID</th>
              <th className="text-left">Item</th>
              <th className="text-left">Bid Amount</th>
              <th className="text-left">Platform Fee</th>
              <th className="text-left">Total</th>
              <th className="text-left">Status</th>
              <th className="text-left">Date</th>
              <th className="text-left">Action</th>
            </tr></thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv._id}>
                  <td><span className="font-mono text-xs text-blue-400">{inv.invoiceId}</span></td>
                  <td><p className="text-white text-sm line-clamp-1">{inv.auction?.title || '–'}</p></td>
                  <td><span className="text-white font-semibold">₹{inv.amount?.toFixed(2)}</span></td>
                  <td><span className="text-yellow-400">₹{inv.platformFee?.toFixed(2)}</span></td>
                  <td><span className="text-green-400 font-bold">₹{inv.totalAmount?.toFixed(2)}</span></td>
                  <td>
                    <span className={`badge ${inv.status === 'paid' ? 'badge-active' : inv.status === 'pending' ? 'badge-pending' : 'badge-ended'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td><span className="text-slate-400 text-xs">{new Date(inv.createdAt).toLocaleDateString()}</span></td>
                  <td>
                    <button onClick={() => download(inv._id, inv.invoiceId)}
                      className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors">
                      <Download size={12} /> PDF
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
