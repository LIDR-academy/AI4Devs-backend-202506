import { Router } from 'express';
import { PositionController } from '../presentation/controllers/positionController';
import { PositionService } from '../application/services/positionService';

const router = Router();

/**
 * @route GET /positions/:id/candidates
 * @desc Obtiene todos los candidatos en proceso para una posición específica
 * @access Public
 */
router.get('/:id/candidates', (req, res) => {
  // Crear instancias dinámicamente usando el middleware de Prisma
  const positionService = new PositionService(req.prisma);
  const positionController = new PositionController(positionService);
  positionController.getCandidatesForPosition(req, res);
});

/**
 * @route PUT /:positionId/candidate/:id/stage
 * @desc Actualiza la etapa del candidato en el proceso de entrevista
 * @access Public
 */
router.put('/:positionId/candidate/:id/stage', (req, res) => {
  // Crear instancias dinámicamente usando el middleware de Prisma
  const positionService = new PositionService(req.prisma);
  const positionController = new PositionController(positionService);
  positionController.updateCandidateStage(req, res);
});

export default router;
