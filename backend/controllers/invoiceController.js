const Invoice = require('../models/Invoice');
const { generateInvoicePDF } = require('../services/invoiceService');

// ─── Get My Invoices ───────────────────────────────────────────────────────────
exports.getMyInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id })
      .populate('auction', 'title images category')
      .populate('bidId', 'amount createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Single Invoice ────────────────────────────────────────────────────────
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('user', 'name email')
      .populate('auction', 'title images category condition')
      .populate('bidId', 'amount createdAt');

    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });

    const isOwner = invoice.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Not authorized.' });

    res.json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Download Invoice PDF ──────────────────────────────────────────────────────
exports.downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('user', 'name email')
      .populate('auction', 'title category')
      .populate('bidId', 'amount');

    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });

    const isOwner = invoice.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Not authorized.' });

    const pdfBuffer = await generateInvoicePDF({
      invoiceId: invoice.invoiceId,
      bidId: invoice.bidId._id.toString(),
      customerName: invoice.user.name,
      customerEmail: invoice.user.email,
      auctionTitle: invoice.auction.title,
      category: invoice.auction.category,
      bidAmount: invoice.amount,
      platformFee: invoice.platformFee,
      totalAmount: invoice.totalAmount,
      date: invoice.createdAt,
      status: invoice.status,
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice_${invoice.invoiceId}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: Get All Invoices ───────────────────────────────────────────────────
exports.adminGetInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('user', 'name email')
      .populate('auction', 'title category')
      .sort({ createdAt: -1 });

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.platformFee, 0);
    const totalBidVolume = invoices.reduce((sum, inv) => sum + inv.amount, 0);

    res.json({ success: true, invoices, stats: { totalRevenue, totalBidVolume, count: invoices.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
