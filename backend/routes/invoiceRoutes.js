const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { getMyInvoices, getInvoice, downloadInvoicePDF, adminGetInvoices } = require('../controllers/invoiceController');

router.get('/', protect, getMyInvoices);
router.get('/admin/all', adminOnly, adminGetInvoices);
router.get('/:id', protect, getInvoice);
router.get('/:id/download', protect, downloadInvoicePDF);

module.exports = router;
