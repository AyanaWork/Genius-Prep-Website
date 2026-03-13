const adminAuth = (req, res, next) => {
  try {
    // Check if auth middleware has run
    if (!req.userId || !req.userRole) {
      return res.status(401).json({ 
        error: 'Authentication required. Please login first.' 
      });
    }

    // Check if user has admin role 
    if (req.userRole !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. Admin privileges required.' 
      });
    }

    next();
    
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

module.exports = adminAuth;