import { Router } from 'express';
import { 
    getCandidatesByPositionController, 
    updateCandidateStageController 
} from '../presentation/controllers/positionController';

const router = Router();

/**
 * GET /positions/:id/candidates
 * Obtiene todos los candidatos en proceso para una posición específica
 */
router.get('/:id/candidates', getCandidatesByPositionController);

export default router;
