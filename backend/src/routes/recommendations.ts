import { Router } from 'express';
import { getRecommendationsForReport, generateNewRecommendations } from '../../../src/services/recommendation.controller';

const router = Router();

// AI Recommendation routes
router.post('/', generateNewRecommendations);
router.get('/:id', getRecommendationsForReport);

export default router;
