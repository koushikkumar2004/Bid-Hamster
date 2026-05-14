const { protect } = require('./authMiddleware');

const adminOnly = async (req, res, next) => {
  await protect(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Admin access required.' });
    }
  });
};

module.exports = { adminOnly };
