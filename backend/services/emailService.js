const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ Email Transporter Error:', error);
  } else {
    console.log('✅ Email Server is ready to take our messages');
  }
});

const getBaseUrl = () => {
  const url = process.env.CLIENT_URL || 'http://localhost:3000';
  return url.split(',')[0].replace(/\/$/, '');
};

// ─── Email Templates ───────────────────────────────────────────────────────────

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { margin: 0; padding: 0; background: #070B1A; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #111827; border: 1px solid #1E3A5F; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #1E3A5F 0%, #7C3AED33 100%); padding: 32px 40px; text-align: center; border-bottom: 1px solid #3B82F620; }
    .logo { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: -1px; }
    .logo span { color: #3B82F6; }
    .body { padding: 40px; }
    h1 { color: #fff; font-size: 24px; margin: 0 0 16px; }
    p { color: #94A3B8; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
    .otp-box { background: #070B1A; border: 2px solid #3B82F6; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp { font-size: 48px; font-weight: 800; color: #3B82F6; letter-spacing: 12px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #3B82F6, #7C3AED); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #1E3A5F; }
    .info-label { color: #64748B; font-size: 13px; }
    .info-value { color: #E2E8F0; font-size: 13px; font-weight: 600; }
    .highlight { color: #3B82F6; font-weight: 700; }
    .amount { font-size: 32px; font-weight: 800; color: #10B981; }
    .footer { padding: 24px 40px; background: #0F172A; text-align: center; }
    .footer p { color: #475569; font-size: 12px; margin: 0; }
    .tag { display: inline-block; background: #3B82F620; color: #3B82F6; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
    .warning { color: #F59E0B !important; }
    .success { color: #10B981 !important; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div style="display:inline-flex;align-items:center;gap:12px;">
          <img src="${getBaseUrl()}/logo.png" width="40" height="40" style="border-radius:8px;" alt="" />
          <div class="logo">Bid<span>Hamster</span></div>
        </div>
        <p style="color:#94A3B8;margin:8px 0 0;font-size:13px;">Real-Time Auction Platform</p>
      </div>
      <div class="body">${content}</div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Bid Hamster. All rights reserved.</p>
        <p style="margin-top:4px;">This is an automated email. Please do not reply.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// ─── Send OTP ──────────────────────────────────────────────────────────────────
const sendOTPEmail = async (email, name, otp) => {
  const content = `
    <div class="tag">EMAIL VERIFICATION</div>
    <h1>Verify Your Email Address</h1>
    <p>Hello <strong style="color:#fff">${name}</strong>,</p>
    <p>Welcome to Bid Hamster! Use the OTP below to verify your email. This code expires in <strong class="warning">10 minutes</strong>.</p>
    <div class="otp-box">
      <div class="otp">${otp}</div>
      <p style="margin:8px 0 0;font-size:12px;color:#64748B">One-Time Password (OTP)</p>
    </div>
    <p>If you didn't create an account, you can safely ignore this email.</p>
  `;

  await transporter.sendMail({
    from: `"Bid Hamster" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔐 Verify Your Bid Hamster Account',
    html: baseTemplate(content),
  });
};

// ─── Bid Success ───────────────────────────────────────────────────────────────
const sendBidSuccessEmail = async (email, { name, auctionTitle, amount, bidId, endTime, invoicePdfBuffer }) => {
  const content = `
    <div class="tag">BID CONFIRMED</div>
    <h1>Your Bid Was Placed! 🎯</h1>
    <p>Hello <strong style="color:#fff">${name}</strong>,</p>
    <p>Your bid has been successfully placed. You are currently the <strong class="success">highest bidder</strong>!</p>
    <div style="background:#070B1A;border-radius:12px;padding:24px;margin:24px 0;">
      <div class="info-row"><span class="info-label">Auction Item</span><span class="info-value">${auctionTitle}</span></div>
      <div class="info-row"><span class="info-label">Your Bid</span><span class="info-value success">₹${amount.toFixed(2)}</span></div>
      <div class="info-row"><span class="info-label">Bid ID</span><span class="info-value">${bidId}</span></div>
      <div class="info-row" style="border:none"><span class="info-label">Auction Ends</span><span class="info-value">${new Date(endTime).toLocaleString()}</span></div>
    </div>
    <p>Your invoice is attached to this email. Keep bidding to stay ahead!</p>
  `;

  const mailOptions = {
    from: `"Bid Hamster" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Bid Confirmed — ${auctionTitle}`,
    html: baseTemplate(content),
  };

  if (invoicePdfBuffer) {
    mailOptions.attachments = [
      {
        filename: `invoice_${bidId}.pdf`,
        content: invoicePdfBuffer,
        contentType: 'application/pdf',
      },
    ];
  }

  await transporter.sendMail(mailOptions);
};

// ─── Outbid Alert ──────────────────────────────────────────────────────────────
const sendOutbidEmail = async (email, { name, auctionTitle, newAmount, auctionId }) => {
  const content = `
    <div class="tag" style="background:#F59E0B20;color:#F59E0B">OUTBID ALERT</div>
    <h1>You've Been Outbid! ⚡</h1>
    <p>Hello <strong style="color:#fff">${name}</strong>,</p>
    <p>Someone placed a higher bid on <strong style="color:#fff">${auctionTitle}</strong>.</p>
    <div style="background:#070B1A;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
      <p style="color:#64748B;margin:0 0 8px;font-size:13px;">Current Highest Bid</p>
      <div class="amount">₹${newAmount.toFixed(2)}</div>
    </div>
    <p>Don't miss out — place a higher bid now to reclaim your spot!</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${process.env.CLIENT_URL}/dashboard/auctions/${auctionId}" class="btn">Place Higher Bid →</a>
    </div>
  `;

  await transporter.sendMail({
    from: `"Bid Hamster" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `⚡ You've Been Outbid on ${auctionTitle}`,
    html: baseTemplate(content),
  });
};

// ─── Auction Winner ────────────────────────────────────────────────────────────
const sendWinnerEmail = async (email, { name, auctionTitle, amount, invoicePdfBuffer }) => {
  const content = `
    <div class="tag" style="background:#10B98120;color:#10B981">AUCTION WON 🏆</div>
    <h1>Congratulations, You Won!</h1>
    <p>Hello <strong style="color:#fff">${name}</strong>,</p>
    <p>You are the winner of the auction for <strong style="color:#fff">${auctionTitle}</strong>!</p>
    <div style="background:#070B1A;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
      <p style="color:#64748B;margin:0 0 8px;font-size:13px;">Winning Bid Amount</p>
      <div class="amount">₹${amount.toFixed(2)}</div>
    </div>
    <p>Your final invoice is attached. The seller will contact you shortly with payment and delivery details.</p>
  `;

  const mailOptions = {
    from: `"Bid Hamster" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🏆 You Won — ${auctionTitle}!`,
    html: baseTemplate(content),
  };

  if (invoicePdfBuffer) {
    mailOptions.attachments = [
      {
        filename: `winner_invoice_${auctionTitle.replace(/\s+/g, '_')}.pdf`,
        content: invoicePdfBuffer,
        contentType: 'application/pdf',
      },
    ];
  }

  await transporter.sendMail(mailOptions);
};

// ─── Deposit Success ───────────────────────────────────────────────────────────
const sendDepositSuccessEmail = async (email, { name, amount, currency, paymentMethod, transactionId, date, newBalanceBase, userCurrency }) => {
  const formatCurrency = (val, code) => {
    const locale = code === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(val);
  };

  const content = `
    <div class="tag" style="background:#10B98120;color:#10B981">DEPOSIT SUCCESSFUL</div>
    <h1>Wallet Deposit Confirmed 💳</h1>
    <p>Hello <strong style="color:#fff">${name}</strong>,</p>
    <p>Your deposit has been successfully processed and added to your wallet.</p>
    <div style="background:#070B1A;border-radius:12px;padding:24px;margin:24px 0;">
      <div class="info-row"><span class="info-label">Amount Deposited</span><span class="info-value success">${formatCurrency(amount, currency)}</span></div>
      <div class="info-row"><span class="info-label">Payment Method</span><span class="info-value">${paymentMethod}</span></div>
      <div class="info-row"><span class="info-label">Transaction ID</span><span class="info-value">${transactionId}</span></div>
      <div class="info-row"><span class="info-label">Date & Time</span><span class="info-value">${new Date(date).toLocaleString()}</span></div>
      <div class="info-row" style="border:none"><span class="info-label">New Wallet Balance</span><span class="info-value highlight">${formatCurrency(newBalanceBase, userCurrency)}</span></div>
    </div>
    <p>Thank you for using Bid Hamster!</p>
  `;

  await transporter.sendMail({
    from: `"Bid Hamster" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `💳 Deposit Successful — ${formatCurrency(amount, currency)}`,
    html: baseTemplate(content),
  });
};

// ─── Password Reset ────────────────────────────────────────────────────────────
const sendPasswordResetEmail = async (email, { name, otp }) => {
  const content = `
    <div class="tag" style="background:#7C3AED20;color:#7C3AED">PASSWORD RESET</div>
    <h1>Reset Your Password</h1>
    <p>Hello <strong style="color:#fff">${name}</strong>,</p>
    <p>Use the OTP below to reset your password. This code expires in <strong class="warning">10 minutes</strong>.</p>
    <div class="otp-box" style="border-color:#7C3AED">
      <div class="otp" style="color:#7C3AED">${otp}</div>
      <p style="margin:8px 0 0;font-size:12px;color:#64748B">Password Reset OTP</p>
    </div>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
  `;

  await transporter.sendMail({
    from: `"Bid Hamster" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔑 Bid Hamster Password Reset OTP',
    html: baseTemplate(content),
  });
};

// ─── New Auction Created ────────────────────────────────────────────────────────
const sendNewAuctionEmail = async (email, { name, auctionTitle, basePrice, startTime, endTime, auctionId, imageUrl }) => {
  const content = `
    <div class="tag" style="background:#3B82F620;color:#3B82F6">NEW LIVE AUCTION 🔥</div>
    <h1>Start Bidding Now!</h1>
    <p>Hello <strong style="color:#fff">${name}</strong>,</p>
    <p>A new live auction has just started for <strong style="color:#fff">${auctionTitle}</strong>.</p>
    ${imageUrl ? `<img src="${imageUrl}" style="width:100%; max-height:250px; object-fit:cover; border-radius:12px; margin:16px 0;" alt="Auction Item" />` : ''}
    <div style="background:#070B1A;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
      <p style="color:#64748B;margin:0 0 8px;font-size:13px;">Starting Base Price</p>
      <div class="amount">₹${basePrice.toFixed(2)}</div>
    </div>
    <div style="background:#070B1A;border-radius:12px;padding:24px;margin:24px 0;">
      <div class="info-row"><span class="info-label">Auction Starts</span><span class="info-value">${new Date(startTime).toLocaleString()}</span></div>
      <div class="info-row" style="border:none"><span class="info-label">Auction Ends</span><span class="info-value">${new Date(endTime).toLocaleString()}</span></div>
    </div>
    <p>The timer is ticking down fast. Don't miss out on this item!</p>
    <div style="text-align:center;margin:24px 0;">
      <a href="${getBaseUrl()}/dashboard/auctions/${auctionId}" class="btn">Place Higher Bid →</a>
    </div>
  `;

  await transporter.sendMail({
    from: `"Bid Hamster" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🔥 New Live Auction Started! — ${auctionTitle}`,
    html: baseTemplate(content),
  });
};

module.exports = {
  sendOTPEmail,
  sendBidSuccessEmail,
  sendOutbidEmail,
  sendWinnerEmail,
  sendPasswordResetEmail,
  sendDepositSuccessEmail,
  sendNewAuctionEmail,
};
