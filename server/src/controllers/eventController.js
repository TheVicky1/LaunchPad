import { storeService } from '../services/storeService.js';

export const getEvents = async (req, res, next) => {
  try {
    const data = await storeService.getEvents(req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const item = await storeService.getEventById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};
