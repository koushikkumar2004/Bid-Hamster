const User = require('../models/User');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const { sendNewAuctionEmail } = require('../services/emailService');
const { sendWhatsAppToAllUsers } = require('../services/whatsappService');

// ─── Dashboard Stats ───────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalAuctions, activeBids, invoices] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Auction.countDocuments(),
      Auction.countDocuments({ status: 'active' }),
      Invoice.find(),
    ]);

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.platformFee, 0);
    const totalBids = await Bid.countDocuments();
    const totalBidVolume = invoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Recent signups per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, role: 'user' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const revenueByDay = await Invoice.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$platformFee' }, volume: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalAuctions, activeBids, totalRevenue, totalBids, totalBidVolume },
      charts: { recentUsers, revenueByDay },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Users ─────────────────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { role: 'user' };
    if (search) query.email = { $regex: search, $options: 'i' };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -verificationCode -passwordResetCode')
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success: true, users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Ban / Unban User ──────────────────────────────────────────────────────────
exports.toggleBanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot ban admin.' });

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({ success: true, message: user.isBanned ? 'User banned.' : 'User unbanned.', isBanned: user.isBanned });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete User ───────────────────────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin.' });

    await Bid.deleteMany({ bidder: user._id });
    await user.deleteOne();

    res.json({ success: true, message: 'User deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Create Live Auction ───────────────────────────────────────────────────────
exports.createAuction = async (req, res) => {
  try {
    const { title, description, category, startingBid, duration } = req.body;

    // Validate duration <= 10 mins
    const durationNum = parseInt(duration);
    if (!durationNum || durationNum > 10 || durationNum <= 0) {
      return res.status(400).json({ success: false, message: 'Duration must be between 1 and 10 minutes.' });
    }

    // Process images
    const images = req.files ? req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    })) : [];

    if (images.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one image is required.' });
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationNum * 60000);

    const auction = await Auction.create({
      title,
      description,
      category,
      startingBid,
      duration: durationNum,
      startTime,
      endTime,
      images,
      seller: req.user._id, // admin
      status: 'active',
      approvalStatus: 'approved',
    });

    res.status(201).json({ success: true, auction, message: 'Auction created successfully and is now LIVE!' });

    // BACKGROUND TASK: Notify all users
    try {
      const users = await User.find({ role: 'user', isVerified: true });
      
      // 1. Create DB Notifications
      const notifications = users.map(u => ({
        userId: u._id,
        type: 'auction_created',
        title: 'New Live Auction!',
        message: `${title} is now live with a base price of ₹${startingBid}. Start bidding now!`,
      }));
      await Notification.insertMany(notifications);

      // 2. Broadcast via Socket.IO
      if (req.io) {
        req.io.emit('auctionCreated', auction);
        
        // Emit personal notification event to each user room
        users.forEach(u => {
          req.io.to(u._id.toString()).emit('newNotification', {
            title: 'New Live Auction!',
            message: `${title} is now live!`,
            type: 'auction_created'
          });
        });
      }

      // 3. Send Emails & WhatsApp
      const emailPromises = users.map(u => 
        sendNewAuctionEmail(u.email, {
          name: u.name,
          auctionTitle: title,
          basePrice: parseFloat(startingBid),
          startTime,
          endTime,
          auctionId: auction._id,
          imageUrl: images[0]?.url,
        }).catch(err => console.error('Email error:', err.message))
      );
      
      const waMessage = `🔥 *New Live Auction Started!*\n\n*${title}*\nBase Price: ₹${startingBid}\n\nAuction ends in exactly ${durationNum} minutes.\nStart bidding now at: ${process.env.CLIENT_URL}/dashboard/auctions/${auction._id}`;
      
      await Promise.all([
        ...emailPromises,
        sendWhatsAppToAllUsers(users, waMessage),
      ]);

      console.log(`✅ Broadcasted new auction ${auction._id} to ${users.length} users.`);
    } catch (bgError) {
      console.error('❌ Error during background notifications for new auction:', bgError);
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
