import { PrismaClient } from '@prisma/client';

export interface CandidateApplicationInfo {
  id: number;
  fullName: string;
  currentInterviewStep: string;
  averageScore: number;
  applicationId: number;
  positionId: number;
}

export interface UpdateCandidateStageRequest {
  newInterviewStepId: number;
}

export class PositionService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Obtiene todos los candidatos en proceso para una posición específica
   * @param positionId - ID de la posición
   * @returns Lista de candidatos con información del proceso de entrevista
   */
  async getCandidatesForPosition(positionId: number): Promise<CandidateApplicationInfo[]> {
    try {
      console.log(`[PositionService] Obteniendo candidatos para la posición ${positionId}`);

      // Verificar que la posición existe
      const position = await this.prisma.position.findUnique({
        where: { id: positionId },
        include: {
          interviewFlow: {
            include: {
              interviewSteps: true
            }
          }
        }
      });

      if (!position) {
        throw new Error(`Position with ID ${positionId} not found`);
      }

      // Obtener todas las aplicaciones para esta posición
      const applications = await this.prisma.application.findMany({
        where: { positionId },
        include: {
          candidate: true,
          interviewStep: true,
          interviews: {
            select: {
              score: true
            }
          }
        }
      });

      console.log(`[PositionService] Encontradas ${applications.length} aplicaciones para la posición ${positionId}`);

      // Mapear los datos a la interfaz requerida
      const candidatesInfo: CandidateApplicationInfo[] = applications.map(application => {
        // Calcular puntuación media
        const scores = application.interviews
          .map(interview => interview.score)
          .filter(score => score !== null) as number[];

        const averageScore = scores.length > 0 
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
          : 0;

        return {
          id: application.candidate.id,
          fullName: `${application.candidate.firstName} ${application.candidate.lastName}`,
          currentInterviewStep: application.interviewStep.name,
          averageScore: Math.round(averageScore * 100) / 100, // Redondear a 2 decimales
          applicationId: application.id,
          positionId: application.positionId
        };
      });

      console.log(`[PositionService] Candidatos procesados exitosamente para la posición ${positionId}`);
      return candidatesInfo;

    } catch (error) {
      console.error(`[PositionService] Error al obtener candidatos para la posición ${positionId}:`, error);
      throw error;
    }
  }

  /**
   * Actualiza la etapa del candidato en el proceso de entrevista
   * @param candidateId - ID del candidato
   * @param newInterviewStepId - ID de la nueva etapa de entrevista
   * @param positionId - ID de la posición
   * @returns Información de la aplicación actualizada
   */
  async updateCandidateStage(candidateId: number, newInterviewStepId: number, positionId: number): Promise<any> {
    try {
      console.log(`[PositionService] Actualizando etapa del candidato ${candidateId} a la etapa ${newInterviewStepId} en la posición ${positionId}`);

      // Verificar que el candidato existe
      const candidate = await this.prisma.candidate.findUnique({
        where: { id: candidateId }
      });

      if (!candidate) {
        throw new Error(`Candidate with ID ${candidateId} not found`);
      }

      // Verificar que la nueva etapa de entrevista existe
      const interviewStep = await this.prisma.interviewStep.findUnique({
        where: { id: newInterviewStepId }
      });

      if (!interviewStep) {
        throw new Error(`Interview step with ID ${newInterviewStepId} not found`);
      }

      // Buscar la aplicación específica del candidato para la posición dada
      const application = await this.prisma.application.findFirst({
        where: { 
          candidateId,
          positionId
        },
        include: {
          position: true,
          interviewStep: true
        }
      });

      if (!application) {
        throw new Error(`No application found for candidate ${candidateId} in position ${positionId}`);
      }

      // Actualizar la etapa actual de la aplicación
      const updatedApplication = await this.prisma.application.update({
        where: { id: application.id },
        data: { currentInterviewStep: newInterviewStepId },
        include: {
          candidate: true,
          interviewStep: true,
          position: true
        }
      });

      console.log(`[PositionService] Etapa del candidato ${candidateId} actualizada exitosamente en la posición ${positionId}`);
      
      return {
        message: 'Candidate stage updated successfully',
        data: {
          candidateId: updatedApplication.candidateId,
          candidateName: `${updatedApplication.candidate.firstName} ${updatedApplication.candidate.lastName}`,
          positionTitle: updatedApplication.position.title,
          previousStage: application.interviewStep.name,
          newStage: updatedApplication.interviewStep.name,
          updatedAt: new Date()
        }
      };

    } catch (error) {
      console.error(`[PositionService] Error al actualizar etapa del candidato ${candidateId}:`, error);
      throw error;
    }
  }
}
