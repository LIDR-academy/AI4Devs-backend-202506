import { Router } from 'express';
import { getCandidatesByPositionController } from '../presentation/controllers/positionController';

const router = Router();

/**
 * GET /positions/:id/candidates
 * Retrieves all candidates that have applied to a specific position
 * 
 * @param id - Position ID (numeric)
 * @returns {PositionCandidatesResponse} List of candidates with their application details and scores
 * 
 * @example
 * GET /positions/1/candidates
 * 
 * Response:
 * {
 *   "message": "Candidates retrieved successfully",
 *   "data": {
 *     "positionId": 1,
 *     "positionTitle": "Senior Frontend Developer",
 *     "totalCandidates": 3,
 *     "candidates": [...]
 *   }
 * }
 */
router.get('/:id/candidates', getCandidatesByPositionController);

export default router;