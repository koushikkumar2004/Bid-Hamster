const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// ─── Create Auction ────────────────────────────────────────────────────────────
exports.createAuction = async (req, res) => {
  try {
    const { title, description, category, condition, startingBid, endTime, bidIncrement } = req.body;

    if (!title || !description || !category || !startingBid || !endTime) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }

    const end = new Date(endTime);
    if (end <= new Date()) {
      return res.status(400).json({ success: false, message: 'End time must be in the future.' });
    }

    const images = req.files
      ? req.files.map((file) => ({ url: file.path, publicId: file.filename }))
      : [];

    if (images.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one image is required.' });
    }

    const auction = await Auction.create({
      title,
      description,
      images,
      category,
      condition: condition || 'Good',
      startingBid: parseFloat(startingBid),
      currentBid: 0,
      bidIncrement: parseFloat(bidIncrement) || 1,
      endTime: end,
      seller: req.user._id,
    });

    await auction.populate('seller', 'name email avatar');
    res.status(201).json({ success: true, message: 'Auction created!', auction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Auctions ──────────────────────────────────────────────────────────
exports.getAuctions = async (req, res) => {
  try {
    const { category, status, search, sort, page = 1, limit = 12, featured } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (featured) query.featured = true;
    if (search) query.title = { $regex: search, $options: 'i' };

    // Auto-expire ended auctions
    await Auction.updateMany({ status: 'active', endTime: { $lte: new Date() } }, { status: 'ended' });

    let sortQuery = { createdAt: -1 };
    if (sort === 'endTime') sortQuery = { endTime: 1 };
    if (sort === 'currentBid') sortQuery = { currentBid: -1 };
    if (sort === 'totalBids') sortQuery = { totalBids: -1 };

    const total = await Auction.countDocuments(query);
    const auctions = await Auction.find(query)
      .populate('seller', 'name avatar')
      .populate('winner', 'name')
      .sort(sortQuery)
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      auctions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Single Auction ────────────────────────────────────────────────────────
exports.getAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'name avatar email')
      .populate('winner', 'name');

    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found.' });

    // Increment views
    auction.views += 1;
    await auction.save();

    const bids = await Bid.find({ auctionId: auction._id })
      .populate('bidder', 'name avatar')
      .sort({ amount: -1 })
      .limit(20);

    res.json({ success: true, auction, bids });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Auction ────────────────────────────────────────────────────────────
exports.updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found.' });

    const isOwner = auction.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Not authorized.' });

    if (auction.totalBids > 0 && !isAdmin) {
      return res.status(400).json({ success: false, message: 'Cannot edit auction with active bids.' });
    }

    const updates = req.body;
    const updated = await Auction.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Auction updated!', auction: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Auction ────────────────────────────────────────────────────────────
exports.deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ success: false, message: 'Auction not found.' });

    const isOwner = auction.seller.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Not authorized.' });

    // Delete images from Cloudinary
    for (const img of auction.images) {
      if (img.publicId) {
        await cloudinary.uploader.destroy(img.publicId);
      }
    }

    await Bid.deleteMany({ auctionId: auction._id });
    await auction.deleteOne();

    res.json({ success: true, message: 'Auction deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Toggle Watchlist ──────────────────────────────────────────────────────────
exports.toggleWatchlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const auctionId = req.params.id;

    const idx = user.watchlist.indexOf(auctionId);
    if (idx === -1) {
      user.watchlist.push(auctionId);
      await Auction.findByIdAndUpdate(auctionId, { $addToSet: { watchers: user._id } });
    } else {
      user.watchlist.splice(idx, 1);
      await Auction.findByIdAndUpdate(auctionId, { $pull: { watchers: user._id } });
    }

    await user.save();
    res.json({ success: true, watchlist: user.watchlist, added: idx === -1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: Get All Auctions ───────────────────────────────────────────────────
exports.adminGetAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find()
      .populate('seller', 'name email')
      .populate('winner', 'name')
      .sort({ createdAt: -1 });
    const stats = {
      total: auctions.length,
      active: auctions.filter((a) => a.status === 'active').length,
      ended: auctions.filter((a) => a.status === 'ended').length,
      pending: auctions.filter((a) => a.status === 'pending').length,
    };
    res.json({ success: true, auctions, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: Update Approval ────────────────────────────────────────────────────
exports.adminUpdateAuction = async (req, res) => {
  try {
    const { status, approvalStatus, featured } = req.body;
    const update = {};
    if (status) update.status = status;
    if (approvalStatus) update.approvalStatus = approvalStatus;
    if (typeof featured === 'boolean') update.featured = featured;

    const auction = await Auction.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, auction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
