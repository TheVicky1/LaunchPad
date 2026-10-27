import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isMongoConnected } from '../config/db.js';
import { User } from '../models/User.js';
import { storeService } from '../services/storeService.js';
import { demoUser } from '../seed/seedData.js';

const JWT_SECRET = process.env.JWT_SECRET || 'launchpad_dev_secret_key_2026';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, skills, interests, preferredLocations, graduationYear } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (isMongoConnected()) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'An account with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email,
        passwordHash,
        skills: skills || ['React', 'JavaScript', 'Node.js'],
        interests: interests || ['Web Development', 'Open Source'],
        preferredLocations: preferredLocations || ['Bengaluru'],
        graduationYear: graduationYear || 2027
      });

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          skills: user.skills,
          interests: user.interests,
          preferredLocations: user.preferredLocations,
          graduationYear: user.graduationYear,
          role: user.role
        }
      });
    }

    // Demo in-memory registration
    const userProfile = storeService.updateUserProfile(demoUser.id, {
      name,
      email,
      skills: skills || demoUser.skills,
      interests: interests || demoUser.interests,
      preferredLocations: preferredLocations || demoUser.preferredLocations,
      graduationYear: graduationYear || demoUser.graduationYear
    });

    const token = jwt.sign({ id: demoUser.id, email: demoUser.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: userProfile
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (isMongoConnected()) {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          skills: user.skills,
          interests: user.interests,
          preferredLocations: user.preferredLocations,
          graduationYear: user.graduationYear,
          role: user.role
        }
      });
    }

    // Demo login
    const user = storeService.getUserProfile();
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = storeService.getUserProfile();
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updated = storeService.updateUserProfile(demoUser.id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
