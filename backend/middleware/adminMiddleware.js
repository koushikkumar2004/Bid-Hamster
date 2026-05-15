const { protect } = require('./authMiddleware');

const adminOnly = [
  protect,
  (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Admin access required. Only administrators can perform this action.' });
    }
  }
];

module.exports = { adminOnly };
