import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/launchpad';
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout to gracefully fallback if no local Mongo
    });
    isConnected = true;
    console.log(`[LaunchPad Backend] MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[LaunchPad Backend] Notice: MongoDB connection unavailable (${error.message}).`);
    console.warn(`[LaunchPad Backend] Operating seamlessly in in-memory fallback mode with curated seed dataset.`);
  }
};

export const isMongoConnected = () => isConnected;
