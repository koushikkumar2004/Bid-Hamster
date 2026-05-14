'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  Zap, 
  Upload, 
  Trash2, 
  DollarSign, 
  Type, 
  AlignLeft, 
  Tag, 
  Clock,
  Plus
} from 'lucide-react';
import { adminAPI, auctionAPI } from '@/services/api';

const CATEGORIES = ['Cars', 'Electronics', 'Fashion', 'Sports', 'Art', 'Collectibles', 'Other'];

export default function CreateAuctionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Electronics',
    startingBid: '',
    duration: '5', // minutes
  });
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setImages([...images, ...files]);
    
    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviewImages(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('startingBid', formData.startingBid);
    data.append('duration', formData.duration);
    
    images.forEach(image => {
      data.append('images', image);
    });

    try {
      // Note: We use the dedicated admin create-auction endpoint
      const res = await adminAPI.createAuction(data);
      toast.success(res.data.message || 'Live Auction Started! 🔥');
      router.push('/admin/auctions');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <Zap size={24} />
          </div>
          Create Live Auction
        </h1>
        <p className="text-slate-400 mt-2">Start a new 10-minute live bidding session with instant notifications.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Details */}
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Type size={18} className="text-blue-400" /> Basic Information
              </h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Auction Title</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. BMW X3 M-Sport 2024"
                  className="w-full bg-[#070B1A] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Description</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Detailed product specifications, condition, etc..."
                  className="w-full bg-[#070B1A] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-[#070B1A] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Duration (Mins)</label>
                  <select 
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: e.target.value})}
                    className="w-full bg-[#070B1A] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(m => <option key={m} value={m}>{m} Minutes</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <DollarSign size={18} className="text-green-400" /> Pricing
              </h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Starting Base Price (₹)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₹</div>
                  <input 
                    required
                    type="number" 
                    value={formData.startingBid}
                    onChange={e => setFormData({...formData, startingBid: e.target.value})}
                    placeholder="0.00"
                    className="w-full bg-[#070B1A] border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Images */}
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4 min-h-[400px] flex flex-col">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Upload size={18} className="text-purple-400" /> Product Images
              </h3>
              
              <div className="flex-1 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center p-8 transition-colors hover:border-purple-500/50 group relative">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleImageChange}
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="p-4 rounded-full bg-slate-800 text-slate-400 group-hover:bg-purple-500/10 group-hover:text-purple-400 transition-all">
                  <Plus size={32} />
                </div>
                <p className="mt-4 text-sm text-slate-400 text-center">
                  Drag and drop or click to upload<br />
                  <span className="text-xs text-slate-600">(Up to 5 high-quality images)</span>
                </p>
              </div>

              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {previewImages.map((src, i) => (
                    <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-700">
                      <img src={src} className="w-full h-full object-cover" alt="" />
                      <button 
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <motion.button
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-4 rounded-xl font-bold text-white shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #3B82F6)', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Starting Auction...
                </>
              ) : (
                <>
                  <Zap size={20} /> Launch Live Auction
                </>
              )}
            </motion.button>
          </div>
        </div>
      </form>

      <style jsx>{`
        .glass-card {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(124, 58, 237, 0.2);
          border-radius: 24px;
          backdrop-filter: blur(12px);
        }
      `}</style>
    </div>
  );
}
