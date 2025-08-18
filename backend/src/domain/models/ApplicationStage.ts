// Interfaces para manejo de etapas de candidatos

/**
 * Estructura del cuerpo de la petición para actualizar etapa
 */
export interface StageUpdateRequest {
  newStage: string;
  notes?: string;
}

/**
 * Información detallada de una etapa de entrevista
 */
export interface InterviewStageInfo {
  id: number;
  name: string;
  orderIndex: number;
}

/**
 * Respuesta completa de actualización de etapa
 */
export interface StageUpdateResponse {
  candidateId: number;
  applicationId: number;
  candidateName: string;
  positionTitle: string;
  previousStage: InterviewStageInfo;
  currentStage: InterviewStageInfo;
  updatedAt: string;
  notes?: string;
}

/**
 * Datos internos para procesamiento de actualización
 */
export interface StageUpdateData {
  candidateId: number;
  applicationId: number;
  newStepId: number;
  notes?: string;
  previousStepId: number;
}
