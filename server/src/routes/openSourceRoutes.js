import express from 'express';
import { getOpenSource, getOpenSourceById } from '../controllers/openSourceController.js';

const router = express.Router();

router.get('/', getOpenSource);
router.get('/:id', getOpenSourceById);

export default router;
