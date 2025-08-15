import { Router } from 'express';
import { getCandidatesByPosition, updateCandidateStage } from '../presentation/controllers/positionController';

const router = Router();

/**
 * GET /positions/:id/candidates
 * Obtiene todos los candidatos de una posición para vista kanban
 * 
 * @param id - ID de la posición
 * @returns Array de candidatos con información del kanban
 */
router.get('/:id/candidates', getCandidatesByPosition);

/**
 * PUT /candidates/:id/stage  
 * Actualiza la etapa de un candidato en el proceso
 * 
 * @param id - ID del candidato
 * @body newStageId - ID de la nueva etapa
 * @body notes - Notas opcionales del cambio
 * @returns Confirmación del cambio realizado
 */
router.put('/candidates/:id/stage', updateCandidateStage);

export default router;
