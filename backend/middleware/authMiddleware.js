import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { userRepository } from '../db/repositories/userRepository.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required. Missing Bearer token.' });
  }

  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token.' });
    }
    const user = userRepository.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User associated with token no longer exists.' });
    }
    req.user = user;
    next();
  });
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, config.jwtSecret, (err, decoded) => {
      if (!err && decoded) {
        req.user = userRepository.findById(decoded.id);
      }
      next();
    });
  } else {
    next();
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `Insufficient permissions. Role '${req.user.role}' is not authorized. Required: [${roles.join(', ')}]` 
      });
    }
    next();
  };
}
