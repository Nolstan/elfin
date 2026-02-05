const jwt = require('jsonwebtoken');

const authMiddleware = (requiredRoles = []) => {
  return (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET );

      // Attach user info to request
      req.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role
      };

      // Check roles if required
      if (requiredRoles.length > 0) {
        if (!requiredRoles.includes(req.user.role)) {
          return res.status(403).json({
            message: 'Access denied. Insufficient permissions.',
            requiredRoles: requiredRoles,
            userRole: req.user.role
          });
        }
      }

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired. Please login again.' });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token.' });
      } else {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ message: 'Server error during authentication.' });
      }
    }
  };
};

module.exports = authMiddleware;