import { Router } from 'express';
import { getCandidatesByPosition } from '../presentation/controllers/positionController';

const router = Router();

// GET /positions/:id/candidates
router.get('/:id/candidates', getCandidatesByPosition);

export default router;
