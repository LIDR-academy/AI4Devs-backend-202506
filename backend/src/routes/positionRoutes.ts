import { Router } from 'express';
import { getCandidatesByPosition } from '../presentation/controllers/positionController';

const router = Router();

// Endpoint: Obtener candidatos en proceso para una posición (Kanban)
// GET /positions/:id/candidates
router.get('/positions/:id/candidates', getCandidatesByPosition);

export default router; 