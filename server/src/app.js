import express from 'express';
import cors from 'cors';
import { storeService } from './services/storeService.js';
import opportunityRoutes from './routes/opportunityRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import openSourceRoutes from './routes/openSourceRoutes.js';
import userTrackingRoutes from './routes/userTrackingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const status = storeService.getStatus();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Launchpad API',
    version: '1.0.0',
    database: status
  });
});

// Primary Routes
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/open-source', openSourceRoutes);
app.use('/api/me', userTrackingRoutes);
app.use('/api/auth', authRoutes);

// Fallback 404
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
