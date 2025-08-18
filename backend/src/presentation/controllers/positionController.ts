import { Request, Response } from 'express';
import { PositionService } from '../../application/services/positionService';

export class PositionController {
  private positionService: PositionService;

  constructor(positionService: PositionService) {
    this.positionService = positionService;
  }

  /**
   * Obtiene todos los candidatos en proceso para una posición específica
   * GET /positions/:id/candidates
   */
  async getCandidatesForPosition(req: Request, res: Response): Promise<void> {
    try {
      console.log(`[PositionController] GET /positions/${req.params.id}/candidates - Iniciando solicitud`);

      const positionId = parseInt(req.params.id);
      
      // Validar el ID de la posición
      if (isNaN(positionId) || positionId <= 0) {
        console.warn(`[PositionController] ID de posición inválido: ${req.params.id}`);
        res.status(400).json({
          error: 'Invalid position ID',
          message: 'Position ID must be a positive integer'
        });
        return;
      }

      // Obtener candidatos para la posición
      const candidates = await this.positionService.getCandidatesForPosition(positionId);
      
      console.log(`[PositionController] Candidatos obtenidos exitosamente para la posición ${positionId}: ${candidates.length} candidatos`);
      
      res.status(200).json({
        success: true,
        data: candidates,
        count: candidates.length,
        positionId: positionId
      });

    } catch (error) {
      console.error(`[PositionController] Error al obtener candidatos para la posición ${req.params.id}:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          res.status(404).json({
            error: 'Position not found',
            message: error.message
          });
        } else {
          res.status(500).json({
            error: 'Internal server error',
            message: 'An error occurred while retrieving candidates for the position'
          });
        }
      } else {
        res.status(500).json({
          error: 'Internal server error',
          message: 'An unexpected error occurred'
        });
      }
    }
  }

  /**
   * Actualiza la etapa del candidato en el proceso de entrevista
   * @param req - Request de Express
   * @param res - Response de Express
   */
  async updateCandidateStage(req: Request, res: Response): Promise<void> {
    try {
      const positionId = parseInt(req.params.positionId);
      const candidateId = parseInt(req.params.id);

      console.log(`[PositionController] PUT /positions/${positionId}/candidate/${candidateId}/stage - Iniciando solicitud`);

      // Validar que los IDs sean números válidos
      if (isNaN(positionId) || positionId <= 0) {
        console.log(`[PositionController] ID de posición inválido: ${req.params.positionId}`);
        res.status(400).json({
          error: 'Invalid position ID',
          message: 'Position ID must be a positive integer'
        });
        return;
      }

      if (isNaN(candidateId) || candidateId <= 0) {
        console.log(`[PositionController] ID de candidato inválido: ${req.params.id}`);
        res.status(400).json({
          error: 'Invalid candidate ID',
          message: 'Candidate ID must be a positive integer'
        });
        return;
      }

      // Validar el cuerpo de la solicitud
      const { newInterviewStepId } = req.body;
      if (!newInterviewStepId || isNaN(newInterviewStepId) || newInterviewStepId <= 0) {
        console.log(`[PositionController] ID de etapa de entrevista inválido: ${newInterviewStepId}`);
        res.status(400).json({
          error: 'Invalid interview step ID',
          message: 'newInterviewStepId must be a positive integer'
        });
        return;
      }

      // Llamar al servicio para actualizar la etapa
      const result = await this.positionService.updateCandidateStage(candidateId, newInterviewStepId, positionId);

      console.log(`[PositionController] Etapa del candidato ${candidateId} actualizada exitosamente`);
      res.status(200).json({
        success: true,
        ...result
      });

    } catch (error: any) {
      console.error(`[PositionController] Error al actualizar etapa del candidato:`, error);

      // Manejar errores específicos
      if (error.message.includes('not found')) {
        res.status(404).json({
          error: 'Resource not found',
          message: error.message
        });
        return;
      }

      if (error.message.includes('No application found')) {
        res.status(400).json({
          error: 'No active application',
          message: error.message
        });
        return;
      }

      // Error interno del servidor
      res.status(500).json({
        error: 'Internal server error',
        message: 'An error occurred while updating the candidate stage'
      });
    }
  }
}
