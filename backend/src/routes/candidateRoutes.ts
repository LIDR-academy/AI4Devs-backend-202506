import { Router } from 'express';
import { addCandidateController, getCandidateById, updateCandidateStage } from '../presentation/controllers/candidateController';

const router = Router();

router.post('/', addCandidateController);
router.get('/:id', getCandidateById);
// Endpoint: Actualizar la etapa del candidato (Kanban)
// PUT /candidates/:id/stage
router.put('/candidates/:id/stage', updateCandidateStage);

export default router;
