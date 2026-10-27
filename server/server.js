import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import { connectDB } from './src/config/db.js';

const PORT = process.env.PORT || 5000;

// Attempt database connection, then start server
connectDB().finally(() => {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 LaunchPad Server is running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`💼 Opportunities: http://localhost:${PORT}/api/opportunities`);
    console.log(`🎪 Events: http://localhost:${PORT}/api/events`);
    console.log(`🌐 Open Source: http://localhost:${PORT}/api/open-source`);
    console.log(`====================================================`);
  });
});
