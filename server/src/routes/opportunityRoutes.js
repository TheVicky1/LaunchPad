import express from 'express';
import {
  getOpportunities,
  getOpportunityById,
  getFeaturedOpportunities
} from '../controllers/opportunityController.js';

const router = express.Router();

router.get('/', getOpportunities);
router.get('/featured', getFeaturedOpportunities);
router.get('/:id', getOpportunityById);

export default router;
