import { storeService } from '../services/storeService.js';
import { demoUser } from '../seed/seedData.js';

const getUserId = (req) => {
  return req.user?.id || req.headers['x-user-id'] || demoUser.id;
};

export const getMyOpportunities = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { status } = req.query;
    const tracked = await storeService.getUserOpportunities(userId, status);
    res.json(tracked);
  } catch (error) {
    next(error);
  }
};

export const saveMyOpportunity = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { opportunityId, applicationStatus, itemType, title, company, category, location, deadline, applicationUrl, notes } = req.body;

    if (!opportunityId) {
      return res.status(400).json({ message: 'opportunityId is required' });
    }

    const saved = await storeService.saveOpportunityForUser(userId, {
      opportunityId,
      applicationStatus: applicationStatus || 'Saved',
      itemType: itemType || 'Opportunity',
      title,
      company,
      category,
      location,
      deadline,
      applicationUrl,
      notes
    });

    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

export const updateMyOpportunity = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params; // opportunityId or tracked record id
    const { applicationStatus, notes } = req.body;

    if (!applicationStatus && notes === undefined) {
      return res.status(400).json({ message: 'applicationStatus or notes is required' });
    }

    const updated = await storeService.updateOpportunityStatus(userId, id, applicationStatus, notes);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteMyOpportunity = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    await storeService.removeOpportunityForUser(userId, id);
    res.json({ message: 'Opportunity removed from tracking', opportunityId: id });
  } catch (error) {
    next(error);
  }
};
