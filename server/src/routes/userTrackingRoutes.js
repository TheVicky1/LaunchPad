import express from 'express';
import {
  getMyOpportunities,
  saveMyOpportunity,
  updateMyOpportunity,
  deleteMyOpportunity
} from '../controllers/userTrackingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/opportunities', getMyOpportunities);
router.post('/opportunities', saveMyOpportunity);
router.patch('/opportunities/:id', updateMyOpportunity);
router.delete('/opportunities/:id', deleteMyOpportunity);

export default router;
