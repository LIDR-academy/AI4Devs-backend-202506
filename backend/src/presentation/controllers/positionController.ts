import { Request, Response } from 'express';
import { KanbanService } from '../../application/services/kanbanService';

export class PositionController {
  private kanbanService: KanbanService;

  constructor(kanbanService: KanbanService) {
    this.kanbanService = kanbanService;
  }

  /**
   * GET /positions/:id/candidates
   * Obtiene todos los candidatos de una posición para vista kanban
   */
  async getCandidatesByPosition(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Log de inicio
      console.log('kanban.getCandidates.start', {
        positionId: req.params.id,
        requestId,
        timestamp: startTime
      });

      // Validar positionId
      const validation = this.kanbanService.validatePositionId(req.params.id);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_POSITION_ID',
            message: validation.error
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId
          }
        });
        return;
      }

      const positionId = parseInt(req.params.id);
      const result = await this.kanbanService.getCandidatesByPosition(positionId);

      // Log de resultado
      const queryTime = Date.now() - startTime;
      console.log('kanban.getCandidates.complete', {
        positionId,
        requestId,
        success: result.success,
        candidateCount: result.success ? result.data.length : 0,
        queryTime,
        timestamp: Date.now()
      });

      // Response según resultado
      if (result.success) {
        // Agregar requestId a metadata
        (result.meta as any).requestId = requestId;
        (result.meta as any).queryTime = queryTime;

        res.status(200).json(result);
      } else {
        const statusCode = (result as any).error.code === 'POS_001' ? 404 : 500;
        res.status(statusCode).json({
          ...result,
          meta: {
            timestamp: new Date().toISOString(),
            requestId
          }
        });
      }

    } catch (error) {
      // Error handling para casos no capturados
      console.error('kanban.getCandidates.error', {
        positionId: req.params.id,
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: Date.now()
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId
        }
      });
    }
  }

  /**
   * PUT /candidates/:id/stage
   * Actualiza la etapa de un candidato en el proceso
   */
  async updateCandidateStage(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Log de inicio
      console.log('kanban.updateStage.start', {
        candidateId: req.params.id,
        requestId,
        payload: req.body,
        timestamp: startTime
      });

      // Validar candidateId
      const candidateValidation = this.kanbanService.validateCandidateId(req.params.id);
      if (!candidateValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CANDIDATE_ID',
            message: candidateValidation.error
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId
          }
        });
        return;
      }

      // Validar payload
      const payloadValidation = this.kanbanService.validateUpdateStageRequest(req.body);
      if (!payloadValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PAYLOAD',
            message: payloadValidation.error
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId
          }
        });
        return;
      }

      const candidateId = parseInt(req.params.id);
      const updateData = {
        newStageId: parseInt(req.body.newStageId),
        notes: req.body.notes
      };

      const result = await this.kanbanService.updateCandidateStage(candidateId, updateData);

      // Log de resultado
      const queryTime = Date.now() - startTime;
      console.log('kanban.updateStage.complete', {
        candidateId,
        requestId,
        success: result.success,
        newStageId: updateData.newStageId,
        queryTime,
        timestamp: Date.now()
      });

      // Response según resultado
      if (result.success) {
        res.status(200).json({
          ...result,
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
            queryTime
          }
        });
      } else {
        // Mapeo de códigos de error a status HTTP
        let statusCode = 500;
        switch ((result as any).error.code) {
          case 'CAN_001':
            statusCode = 404;
            break;
          case 'STG_001':
            statusCode = 400;
            break;
          case 'CON_001':
            statusCode = 409;
            break;
          default:
            statusCode = 500;
        }

        res.status(statusCode).json({
          ...result,
          meta: {
            timestamp: new Date().toISOString(),
            requestId
          }
        });
      }

    } catch (error) {
      // Error handling para casos no capturados
      console.error('kanban.updateStage.error', {
        candidateId: req.params.id,
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: Date.now()
      });

      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor'
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId
        }
      });
    }
  }
}

// Factory function para crear controller con dependencias
export const createPositionController = (kanbanService: KanbanService): PositionController => {
  return new PositionController(kanbanService);
};

// Funciones controller para usar en routes (manteniendo compatibilidad con patrón existente)
export const getCandidatesByPosition = async (req: Request, res: Response): Promise<void> => {
  const kanbanService = new KanbanService(req.prisma);
  const controller = new PositionController(kanbanService);
  await controller.getCandidatesByPosition(req, res);
};

export const updateCandidateStage = async (req: Request, res: Response): Promise<void> => {
  const kanbanService = new KanbanService(req.prisma);
  const controller = new PositionController(kanbanService);
  await controller.updateCandidateStage(req, res);
};
