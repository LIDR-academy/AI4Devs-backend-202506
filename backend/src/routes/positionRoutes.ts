import { Router } from 'express';
import { getCandidatesByPosition } from '../presentation/controllers/positionController';

const router = Router();

// Middleware de logging específico para rutas de posiciones
router.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} /positions${req.path}`);
  next();
});

// GET /positions/:id/candidates - Obtener candidatos de una posición específica
router.get('/:id/candidates', getCandidatesByPosition);

export default router;
