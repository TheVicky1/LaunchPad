import jwt from 'jsonwebtoken';
import { demoUser } from '../seed/seedData.js';

const JWT_SECRET = process.env.JWT_SECRET || 'launchpad_dev_secret_key_2026';

export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // In local demo mode, fallback to default demo user gracefully
    req.user = { id: demoUser.id, email: demoUser.email, role: demoUser.role };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Graceful fallback for invalid/expired tokens in demo mode
    req.user = { id: demoUser.id, email: demoUser.email, role: demoUser.role };
    next();
  }
};
