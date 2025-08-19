import { Router } from 'express';
import { getCandidatesByPositionController, updateCandidateStageController } from '../presentation/controllers/positionController';

const router = Router();

/**
 * GET /positions/:id/candidates
 * Get all candidates in process for a specific position (Kanban interface)
 */
router.get('/:id/candidates', getCandidatesByPositionController);

export default router;
