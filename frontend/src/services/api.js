import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ── Request interceptor (attach token) ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor (handle 401) ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin-login', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ── Auctions ──────────────────────────────────────────────────────────────────
export const auctionAPI = {
  create: (data) => api.post('/auctions', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => api.get('/auctions', { params }),
  getOne: (id) => api.get(`/auctions/${id}`),
  update: (id, data) => api.put(`/auctions/${id}`, data),
  delete: (id) => api.delete(`/auctions/${id}`),
  toggleWatchlist: (id) => api.post(`/auctions/${id}/watchlist`),
  adminGetAll: () => api.get('/auctions/admin/all'),
  adminUpdate: (id, data) => api.patch(`/auctions/admin/${id}`, data),
};

// ── Bids ──────────────────────────────────────────────────────────────────────
export const bidAPI = {
  getHistory: (params) => api.get('/bids/history', { params }),
  getMyBids: () => api.get('/bids/my-bids'),
  getWon: () => api.get('/bids/won'),
  adminGetAll: () => api.get('/bids/admin/all'),
};

// ── Invoices ──────────────────────────────────────────────────────────────────
export const invoiceAPI = {
  getMyInvoices: () => api.get('/invoices'),
  getOne: (id) => api.get(`/invoices/${id}`),
  download: (id) => api.get(`/invoices/${id}/download`, { responseType: 'blob' }),
  adminGetAll: () => api.get('/invoices/admin/all'),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (id) => api.patch(`/admin/users/${id}/ban`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  createAuction: (data) => api.post('/admin/create-auction', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: () => api.put('/notifications/read'),
};

// ── Wallet ────────────────────────────────────────────────────────────────────
export const walletAPI = {
  deposit: (data) => api.post('/wallet/deposit', data),
  verify: (data) => api.post('/wallet/verify', data),
  getHistory: () => api.get('/wallet/history'),
};

export default api;
