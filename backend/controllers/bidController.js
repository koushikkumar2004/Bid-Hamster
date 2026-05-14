const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const Invoice = require('../models/Invoice');

// ─── Get Bid History for an Auction ───────────────────────────────────────────
exports.getBidHistory = async (req, res) => {
  try {
    const { auctionId } = req.query;
    const query = auctionId ? { auctionId } : { bidder: req.user._id };

    const bids = await Bid.find(query)
      .populate('bidder', 'name avatar email')
      .populate('auctionId', 'title images currentBid endTime status')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, bids });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get My Bids ───────────────────────────────────────────────────────────────
exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .populate('auctionId', 'title images currentBid endTime status winner category')
      .sort({ createdAt: -1 });

    const won = bids.filter((b) => b.isWinningBid);
    const active = bids.filter((b) => b.auctionId?.status === 'active');
    const lost = bids.filter((b) => b.auctionId?.status === 'ended' && !b.isWinningBid);

    res.json({ success: true, bids, stats: { total: bids.length, won: won.length, active: active.length, lost: lost.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Won Auctions ──────────────────────────────────────────────────────────
exports.getWonAuctions = async (req, res) => {
  try {
    const wonAuctions = await Auction.find({ winner: req.user._id })
      .populate('seller', 'name avatar')
      .sort({ updatedAt: -1 });
    res.json({ success: true, auctions: wonAuctions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Admin: Get All Bids ───────────────────────────────────────────────────────
exports.adminGetBids = async (req, res) => {
  try {
    const bids = await Bid.find()
      .populate('bidder', 'name email')
      .populate('auctionId', 'title currentBid')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, bids });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
