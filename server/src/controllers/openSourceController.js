import { storeService } from '../services/storeService.js';

export const getOpenSource = async (req, res, next) => {
  try {
    const data = await storeService.getOpenSource(req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getOpenSourceById = async (req, res, next) => {
  try {
    const item = await storeService.getOpenSourceById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Open source program not found' });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};
