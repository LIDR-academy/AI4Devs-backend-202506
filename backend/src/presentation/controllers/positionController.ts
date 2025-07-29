import { Request, Response, NextFunction } from 'express';
import { positionService } from '../../application/services/positionService';

/**
 * Controlador para obtener los candidatos en proceso para una posición (Kanban)
 * @route GET /positions/:id/candidates
 */
export const getCandidatesByPosition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const positionId = parseInt(req.params.id, 10);
    if (isNaN(positionId)) {
      return res.status(400).json({ error: 'El parámetro id debe ser un número válido.' });
    }
    // Llama al servicio para obtener los candidatos Kanban
    const candidates = await positionService.getCandidatesByPosition(positionId);
    res.json(candidates);
  } catch (error) {
    next(error);
  }
}; 