import { Router } from 'express';
import { getCandidatesByPositionController, getAllInterviewStepsController } from '../presentation/controllers/positionController';

const router = Router();

// GET /positions/:id/candidates - Get all candidates for a specific position
router.get('/:id/candidates', getCandidatesByPositionController);

// GET /interview-steps - Get all interview steps for kanban UI
router.get('/interview-steps', getAllInterviewStepsController);

export default router;
