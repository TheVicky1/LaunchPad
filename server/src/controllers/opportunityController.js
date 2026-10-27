import { storeService } from '../services/storeService.js';

export const getOpportunities = async (req, res, next) => {
  try {
    const data = await storeService.getOpportunities(req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getOpportunityById = async (req, res, next) => {
  try {
    const item = await storeService.getOpportunityById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Opportunity not found' });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedOpportunities = async (req, res, next) => {
  try {
    const featured = await storeService.getFeaturedOpportunities();
    res.json(featured);
  } catch (error) {
    next(error);
  }
};
