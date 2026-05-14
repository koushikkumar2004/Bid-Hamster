const PDFDocument = require('pdfkit');

/**
 * Generate a PDF invoice buffer
 */
const generateInvoicePDF = (invoiceData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const {
      invoiceId,
      bidId,
      customerName,
      customerEmail,
      auctionTitle,
      category,
      bidAmount,
      platformFee,
      totalAmount,
      date,
      status,
    } = invoiceData;

    const primaryColor = '#3B82F6';
    const darkBg = '#070B1A';
    const cardBg = '#111827';

    // ─── Header ──────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 120).fill(darkBg);
    doc.fontSize(32).fillColor(primaryColor).font('Helvetica-Bold').text('BidNexus', 50, 35);
    doc.fontSize(12).fillColor('#94A3B8').font('Helvetica').text('Real-Time Auction Platform', 50, 75);
    doc.fontSize(12).fillColor('#94A3B8').text('INVOICE', { align: 'right' }).moveUp();
    doc.fillColor('#FFFFFF').fontSize(14).text(`#${invoiceId}`, { align: 'right' });

    // ─── Divider ──────────────────────────────────────────────
    doc.moveTo(50, 130).lineTo(545, 130).strokeColor(primaryColor).lineWidth(1).stroke();

    // ─── Invoice Meta ─────────────────────────────────────────
    doc.moveDown(2);
    doc.fontSize(11).fillColor('#94A3B8').text(`Date:`, 50, 150);
    doc.fillColor('#FFFFFF').text(new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 130, 150);

    doc.fillColor('#94A3B8').text('Status:', 50, 168);
    doc.fillColor(status === 'paid' ? '#10B981' : '#F59E0B').text(status.toUpperCase(), 130, 168);

    doc.fillColor('#94A3B8').text('Bid ID:', 50, 186);
    doc.fillColor('#FFFFFF').text(String(bidId), 130, 186);

    // ─── Customer Section ─────────────────────────────────────
    doc.rect(50, 220, 495, 80).fill(cardBg).stroke();
    doc.fontSize(10).fillColor('#64748B').text('BILLED TO', 70, 232).moveDown(0.3);
    doc.fontSize(13).fillColor('#FFFFFF').font('Helvetica-Bold').text(customerName, 70, 248);
    doc.fontSize(11).fillColor('#94A3B8').font('Helvetica').text(customerEmail, 70, 266);

    // ─── Item Table Header ────────────────────────────────────
    doc.rect(50, 320, 495, 36).fill(primaryColor);
    doc.fontSize(11).fillColor('#FFFFFF').font('Helvetica-Bold');
    doc.text('ITEM DESCRIPTION', 70, 333);
    doc.text('CATEGORY', 300, 333);
    doc.text('AMOUNT', 460, 333);

    // ─── Item Row ─────────────────────────────────────────────
    doc.rect(50, 356, 495, 48).fill(cardBg);
    doc.fontSize(11).fillColor('#E2E8F0').font('Helvetica');
    doc.text(auctionTitle, 70, 370, { width: 220 });
    doc.text(category, 300, 370);
    doc.fillColor('#10B981').text(`$${bidAmount.toFixed(2)}`, 460, 370);

    // ─── Totals ───────────────────────────────────────────────
    let y = 430;
    doc.rect(50, y, 495, 1).fill('#1E3A5F');
    y += 16;
    doc.fontSize(11).fillColor('#94A3B8').font('Helvetica').text('Bid Amount:', 350, y);
    doc.fillColor('#FFFFFF').text(`$${bidAmount.toFixed(2)}`, 480, y, { align: 'right' });
    y += 22;
    doc.fillColor('#94A3B8').text('Platform Fee (5%):', 350, y);
    doc.fillColor('#F59E0B').text(`$${platformFee.toFixed(2)}`, 480, y, { align: 'right' });
    y += 16;
    doc.rect(50, y, 495, 1).fill('#1E3A5F');
    y += 16;
    doc.fontSize(14).fillColor('#FFFFFF').font('Helvetica-Bold').text('TOTAL DUE:', 350, y);
    doc.fillColor(primaryColor).text(`$${totalAmount.toFixed(2)}`, 480, y, { align: 'right' });

    // ─── Footer ───────────────────────────────────────────────
    const footerY = doc.page.height - 80;
    doc.rect(0, footerY, doc.page.width, 80).fill(darkBg);
    doc.fontSize(10).fillColor('#475569').font('Helvetica')
      .text('Thank you for using BidNexus. This is a computer-generated invoice.',
        50, footerY + 20, { align: 'center', width: doc.page.width - 100 });
    doc.text('© ' + new Date().getFullYear() + ' BidNexus — All rights reserved.',
      50, footerY + 40, { align: 'center', width: doc.page.width - 100 });

    doc.end();
  });
};

module.exports = { generateInvoicePDF };
