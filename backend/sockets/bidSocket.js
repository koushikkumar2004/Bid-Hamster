const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const { generateInvoicePDF } = require('../services/invoiceService');
const { sendBidSuccessEmail, sendOutbidEmail, sendWinnerEmail } = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');

const initBidSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── Join Personal Room ───────────────────────────────────────
    socket.on('joinPersonal', ({ userId }) => {
      if (userId) {
        socket.join(userId.toString());
        console.log(`👤 User ${userId} joined personal room`);
      }
    });

    // ─── Join Auction Room ────────────────────────────────────────
    socket.on('joinAuction', async ({ auctionId, userId }) => {
      socket.join(auctionId);
      console.log(`👤 User ${userId} joined auction room: ${auctionId}`);

      try {
        const auction = await Auction.findById(auctionId).populate('seller', 'name');
        const bids = await Bid.find({ auctionId }).populate('bidder', 'name avatar').sort({ amount: -1 }).limit(10);

        socket.emit('auctionData', { auction, bids });
      } catch (err) {
        socket.emit('error', { message: 'Failed to load auction data' });
      }
    });

    // ─── Place Bid ────────────────────────────────────────────────
    socket.on('placeBid', async ({ auctionId, userId, amount }) => {
      try {
        const auction = await Auction.findById(auctionId);
        if (!auction) return socket.emit('bidError', { message: 'Auction not found' });
        if (auction.status !== 'active') return socket.emit('bidError', { message: 'Auction is not active' });
        if (new Date() > auction.endTime) return socket.emit('bidError', { message: 'Auction has ended' });
        if (auction.seller.toString() === userId) return socket.emit('bidError', { message: 'You cannot bid on your own auction' });

        const minBid = auction.currentBid > 0 ? auction.currentBid + auction.bidIncrement : auction.startingBid;
        if (amount < minBid) {
          return socket.emit('bidError', { message: `Bid must be at least ₹${minBid.toFixed(2)}` });
        }

        // Find previous highest bidder for outbid notification and refund
        const previousHighestBid = await Bid.findOne({ auctionId }).sort({ amount: -1 }).populate('bidder', 'email name');

        // Prevent consecutive bids by the same user
        if (previousHighestBid && previousHighestBid.bidder._id.toString() === userId) {
          return socket.emit('bidError', { message: 'You are already the highest bidder!' });
        }

        const bidder = await User.findById(userId);

        if (bidder.walletBalance < amount) {
          return socket.emit('bidError', { message: 'Insufficient wallet balance. Please add money to your wallet.' });
        }

        // Create bid
        const bid = await Bid.create({ auctionId, bidder: userId, amount });

        // Deduct from current bidder
        bidder.walletBalance -= amount;
        await bidder.save();

        // Refund previous highest bidder & Notify
        if (previousHighestBid && previousHighestBid.bidder) {
          const prevBidder = await User.findById(previousHighestBid.bidder._id);
          if (prevBidder) {
            prevBidder.walletBalance += previousHighestBid.amount;
            await prevBidder.save();
            
            // 1. Emit wallet update
            io.to(prevBidder._id.toString()).emit('walletUpdated', { newBalance: prevBidder.walletBalance });

            // 2. Create DB Notification
            await Notification.create({
              userId: prevBidder._id,
              type: 'outbid',
              title: 'You have been outbid!',
              message: `Someone placed a higher bid on ${auction.title}. Your ₹${previousHighestBid.amount} has been refunded to your wallet.`,
            });

            // 3. Emit real-time notification
            io.to(prevBidder._id.toString()).emit('newNotification', {
              title: 'You have been outbid!',
              message: `Someone placed a higher bid on ${auction.title}`,
              type: 'outbid'
            });

            // 4. Send Email
            sendOutbidEmail(prevBidder.email, {
              name: prevBidder.name,
              auctionTitle: auction.title,
              newAmount: amount,
              auctionId,
            }).catch(console.error);
          }
        }

        // Update auction currentBid
        auction.currentBid = amount;
        auction.totalBids += 1;
        await auction.save();

        // Generate invoice
        const invoiceId = `INV-${uuidv4().split('-')[0].toUpperCase()}`;
        const platformFee = amount * 0.05;
        const totalAmount = amount + platformFee;

        // Generate PDF buffer
        const pdfBuffer = await generateInvoicePDF({
          invoiceId,
          bidId: bid._id.toString(),
          customerName: bidder.name,
          customerEmail: bidder.email,
          auctionTitle: auction.title,
          category: auction.category,
          bidAmount: amount,
          platformFee,
          totalAmount,
          date: new Date(),
          status: 'pending',
        });

        // Save invoice
        const invoice = await Invoice.create({
          invoiceId,
          bidId: bid._id,
          user: userId,
          auction: auctionId,
          amount,
          platformFee,
          totalAmount,
          status: 'pending',
        });

        // Update bid with invoiceId
        bid.invoiceId = invoiceId;
        await bid.save();

        // Send bid success email with PDF
        sendBidSuccessEmail(bidder.email, {
          name: bidder.name,
          auctionTitle: auction.title,
          amount,
          bidId: bid._id.toString(),
          endTime: auction.endTime,
          invoicePdfBuffer: pdfBuffer,
        }).catch(console.error);

        const populatedBid = await Bid.findById(bid._id).populate('bidder', 'name avatar');

        // Broadcast new bid to all in room
        io.to(auctionId).emit('newBid', {
          bid: populatedBid,
          currentBid: amount,
          totalBids: auction.totalBids,
          auctionId,
        });

        socket.emit('bidSuccess', {
          bid: populatedBid,
          invoiceId,
          message: 'Bid placed successfully!',
          newBalance: bidder.walletBalance,
        });

      } catch (err) {
        console.error('❌ Bid socket error:', err);
        socket.emit('bidError', { message: err.message || 'Failed to place bid' });
      }
    });

    // ─── Leave Auction Room ───────────────────────────────────────
    socket.on('leaveAuction', ({ auctionId }) => {
      socket.leave(auctionId);
      console.log(`👋 Socket ${socket.id} left auction: ${auctionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  // ─── Auction Ending Cron (check every minute) ─────────────────
  setInterval(async () => {
    try {
      const endedAuctions = await Auction.find({
        status: 'active',
        endTime: { $lte: new Date() },
      });

      for (const auction of endedAuctions) {
        auction.status = 'ended';

        // Find winner (highest bid)
        const winningBid = await Bid.findOne({ auctionId: auction._id }).sort({ amount: -1 }).populate('bidder', 'name email');

        if (winningBid) {
          auction.winner = winningBid.bidder._id;
          winningBid.isWinningBid = true;
          await winningBid.save();

          // Send winner email
          const invoiceId = `INV-WIN-${uuidv4().split('-')[0].toUpperCase()}`;
          const platformFee = winningBid.amount * 0.05;
          const totalAmount = winningBid.amount + platformFee;

          const pdfBuffer = await generateInvoicePDF({
            invoiceId,
            bidId: winningBid._id.toString(),
            customerName: winningBid.bidder.name,
            customerEmail: winningBid.bidder.email,
            auctionTitle: auction.title,
            category: auction.category,
            bidAmount: winningBid.amount,
            platformFee,
            totalAmount,
            date: new Date(),
            status: 'paid',
          });

          sendWinnerEmail(winningBid.bidder.email, {
            name: winningBid.bidder.name,
            auctionTitle: auction.title,
            amount: winningBid.amount,
            invoicePdfBuffer: pdfBuffer,
          }).catch(console.error);
        }

        await auction.save();

        // Notify all in auction room
        io.to(auction._id.toString()).emit('auctionEnded', {
          auctionId: auction._id,
          winner: winningBid ? winningBid.bidder : null,
          finalBid: auction.currentBid,
        });
      }
    } catch (err) {
      console.error('❌ Auction end check error:', err.message);
    }
  }, 10 * 1000); // Check every 10 seconds for better precision
};

module.exports = initBidSocket;
