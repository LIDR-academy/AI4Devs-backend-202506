import { PrismaClient } from '@prisma/client';
import { KanbanRepository, KanbanCandidateData, UpdateStageData } from '../../infrastructure/database/kanbanRepository';

export interface PositionMetadata {
  positionId: number;
  totalCandidates: number;
  positionTitle: string;
  lastUpdated: string;
  requestId?: string;
  queryTime?: number;
}

export interface GetCandidatesResponse {
  success: boolean;
  data: KanbanCandidateData[];
  meta: PositionMetadata;
}

export interface UpdateStageRequest {
  newStageId: number;
  notes?: string;
}

export interface UpdateStageResponse {
  success: boolean;
  data: UpdateStageData;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export class KanbanService {
  private kanbanRepository: KanbanRepository;

  constructor(prisma: PrismaClient) {
    this.kanbanRepository = new KanbanRepository(prisma);
  }

  /**
   * Obtiene todos los candidatos de una posición para vista kanban
   * @param positionId ID de la posición
   * @returns Response con candidatos y metadata
   */
  async getCandidatesByPosition(positionId: number): Promise<GetCandidatesResponse | ErrorResponse> {
    try {
      // Validar que la posición existe
      const positionExists = await this.kanbanRepository.positionExists(positionId);
      if (!positionExists) {
        return {
          success: false,
          error: {
            code: 'POS_001',
            message: `Posición con ID ${positionId} no encontrada`
          }
        };
      }

      // Obtener candidatos y metadata en paralelo
      const [candidates, metadata] = await Promise.all([
        this.kanbanRepository.findCandidatesByPosition(positionId),
        this.kanbanRepository.getPositionMetadata(positionId)
      ]);

      return {
        success: true,
        data: candidates,
        meta: metadata
      };

    } catch (error) {
      console.error('Error en getCandidatesByPosition:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Actualiza la etapa de un candidato en el proceso de entrevistas
   * @param candidateId ID del candidato
   * @param updateData Datos del update (newStageId, notes opcionales)
   * @returns Response con resultado del update
   */
  async updateCandidateStage(
    candidateId: number, 
    updateData: UpdateStageRequest
  ): Promise<UpdateStageResponse | ErrorResponse> {
    try {
      // Validar que el candidato tiene application activa
      const hasActiveApplication = await this.kanbanRepository.candidateHasActiveApplication(candidateId);
      if (!hasActiveApplication) {
        return {
          success: false,
          error: {
            code: 'CAN_001',
            message: `Candidato con ID ${candidateId} no tiene application activa`
          }
        };
      }

      // Validar que la nueva etapa es válida para este candidato
      const isValidStage = await this.kanbanRepository.validateStageForCandidate(
        candidateId, 
        updateData.newStageId
      );
      if (!isValidStage) {
        return {
          success: false,
          error: {
            code: 'STG_001',
            message: `Stage ${updateData.newStageId} no es válido para el candidato ${candidateId}`
          }
        };
      }

      // Realizar el update
      const updateResult = await this.kanbanRepository.updateApplicationStage(
        candidateId,
        updateData.newStageId,
        updateData.notes
      );

      // Log de auditoria
      this.logStageChange(candidateId, updateResult);

      return {
        success: true,
        data: updateResult,
        message: `Candidato movido exitosamente de "${updateResult.previousStage}" a "${updateResult.newStage}"`
      };

    } catch (error) {
      console.error('Error en updateCandidateStage:', error);
      
      // Manejo específico de errores de concurrencia
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        return {
          success: false,
          error: {
            code: 'CON_001',
            message: 'El candidato fue modificado por otro usuario. Por favor, recarga la página e intenta nuevamente.'
          }
        };
      }

      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Valida que los parámetros de entrada sean correctos
   * @param positionId ID de la posición
   * @returns true si es válido, mensaje de error si no
   */
  validatePositionId(positionId: any): { isValid: boolean; error?: string } {
    const id = parseInt(positionId);
    if (isNaN(id) || id <= 0) {
      return {
        isValid: false,
        error: 'Position ID debe ser un número entero positivo'
      };
    }
    return { isValid: true };
  }

  /**
   * Valida que los parámetros de entrada para candidato sean correctos
   * @param candidateId ID del candidato
   * @returns true si es válido, mensaje de error si no
   */
  validateCandidateId(candidateId: any): { isValid: boolean; error?: string } {
    const id = parseInt(candidateId);
    if (isNaN(id) || id <= 0) {
      return {
        isValid: false,
        error: 'Candidate ID debe ser un número entero positivo'
      };
    }
    return { isValid: true };
  }

  /**
   * Valida el payload para update de stage
   * @param updateData Datos del update
   * @returns true si es válido, mensaje de error si no
   */
  validateUpdateStageRequest(updateData: any): { isValid: boolean; error?: string } {
    if (!updateData || typeof updateData !== 'object') {
      return {
        isValid: false,
        error: 'Request body debe ser un objeto válido'
      };
    }

    if (!updateData.newStageId || isNaN(parseInt(updateData.newStageId))) {
      return {
        isValid: false,
        error: 'newStageId es requerido y debe ser un número entero'
      };
    }

    // Notes es opcional, pero si viene debe ser string
    if (updateData.notes && typeof updateData.notes !== 'string') {
      return {
        isValid: false,
        error: 'notes debe ser un string si se proporciona'
      };
    }

    return { isValid: true };
  }

  /**
   * Log estructurado para auditoria de cambios de stage
   * @param candidateId ID del candidato
   * @param updateResult Resultado del update
   */
  private logStageChange(candidateId: number, updateResult: UpdateStageData): void {
    console.log('kanban.updateStage.success', {
      candidateId,
      previousStage: updateResult.previousStage,
      newStage: updateResult.newStage,
      timestamp: updateResult.updatedAt,
      action: 'STAGE_CHANGE'
    });
  }
}
