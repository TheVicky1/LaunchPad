import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Opportunity } from '../models/Opportunity.js';
import { Event } from '../models/Event.js';
import { OpenSourceProgram } from '../models/OpenSourceProgram.js';
import { User } from '../models/User.js';
import { opportunitiesData, eventsData, openSourceData, demoUser } from './seedData.js';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/launchpad';
  console.log(`[Seed Runner] Connecting to MongoDB: ${uri}...`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Seed Runner] Connected to MongoDB.');

    console.log('[Seed Runner] Clearing old records...');
    await Promise.all([
      Opportunity.deleteMany({}),
      Event.deleteMany({}),
      OpenSourceProgram.deleteMany({}),
      User.deleteMany({})
    ]);

    console.log('[Seed Runner] Seeding Opportunities...');
    await Opportunity.insertMany(opportunitiesData.map(({ id, ...rest }) => rest));

    console.log('[Seed Runner] Seeding Events...');
    await Event.insertMany(eventsData.map(({ id, ...rest }) => rest));

    console.log('[Seed Runner] Seeding Open Source Programs...');
    await OpenSourceProgram.insertMany(openSourceData.map(({ id, ...rest }) => rest));

    console.log('[Seed Runner] Seeding Demo User...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('student123', salt);
    await User.create({
      ...demoUser,
      passwordHash
    });

    console.log('[Seed Runner] Database successfully seeded with all initial records!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Runner] Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
