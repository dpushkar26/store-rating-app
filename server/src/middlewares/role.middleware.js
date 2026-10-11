const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: Requires one of [${allowedRoles.join(', ')}] roles` 
      });
    }

    next();
  };
};

module.exports = { requireRole };