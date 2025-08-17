import { Router } from 'express';
import { getCandidatesForPositionController } from '../presentation/controllers/positionController';

const router = Router();

// GET /positions/:id/candidates - Obtener candidatos para una posición específica
router.get('/:id/candidates', getCandidatesForPositionController);

export default router; 