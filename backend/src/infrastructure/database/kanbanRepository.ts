import { PrismaClient } from '@prisma/client';

export interface KanbanCandidateData {
  id: number;
  fullName: string;
  currentInterviewStep: {
    id: number;
    name: string;
    orderIndex: number;
  };
  averageScore: number | null;
  applicationDate: string;
}

export interface UpdateStageData {
  candidateId: number;
  previousStage: string;
  newStage: string;
  updatedAt: string;
}

export class KanbanRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Obtiene todos los candidatos de una posición específica con datos optimizados para kanban
   * @param positionId ID de la posición
   * @returns Array de candidatos con información del kanban
   */
  async findCandidatesByPosition(positionId: number): Promise<KanbanCandidateData[]> {
    const applications = await this.prisma.application.findMany({
      where: { positionId },
      select: {
        id: true,
        applicationDate: true,
        currentInterviewStep: true,
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        interviewStep: {
          select: {
            id: true,
            name: true,
            orderIndex: true
          }
        },
        interviews: {
          select: {
            score: true
          },
          where: {
            score: { not: null }
          }
        }
      },
      orderBy: {
        applicationDate: 'desc'
      }
    });

    return applications.map((app: any) => ({
      id: app.candidate.id,
      fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
      currentInterviewStep: {
        id: app.interviewStep.id,
        name: app.interviewStep.name,
        orderIndex: app.interviewStep.orderIndex
      },
      averageScore: this.calculateAverageScore(app.interviews),
      applicationDate: app.applicationDate.toISOString()
    }));
  }

  /**
   * Actualiza la etapa actual de un candidato en su application
   * @param candidateId ID del candidato
   * @param newStageId ID de la nueva etapa
   * @param notes Notas opcionales del cambio
   * @returns Datos del update realizado
   */
  async updateApplicationStage(
    candidateId: number, 
    newStageId: number, 
    notes?: string
  ): Promise<UpdateStageData> {
    // Primero obtenemos la información actual
    const currentApplication = await this.prisma.application.findFirst({
      where: { candidateId },
      include: {
        interviewStep: {
          select: { name: true }
        }
      }
    });

    if (!currentApplication) {
      throw new Error(`No se encontró application activa para candidato ${candidateId}`);
    }

    // Obtenemos información de la nueva etapa
    const newStage = await this.prisma.interviewStep.findUnique({
      where: { id: newStageId },
      select: { name: true }
    });

    if (!newStage) {
      throw new Error(`Stage ${newStageId} no encontrado`);
    }

    // Realizamos el update atomico
    const updatedApplication = await this.prisma.application.update({
      where: { id: currentApplication.id },
      data: {
        currentInterviewStep: newStageId,
        notes: notes || currentApplication.notes,
        updatedAt: new Date()
      }
    });

    return {
      candidateId,
      previousStage: currentApplication.interviewStep.name,
      newStage: newStage.name,
      updatedAt: updatedApplication.updatedAt?.toISOString() || new Date().toISOString()
    };
  }

  /**
   * Verifica si una posición existe
   * @param positionId ID de la posición
   * @returns true si existe, false si no
   */
  async positionExists(positionId: number): Promise<boolean> {
    const position = await this.prisma.position.findUnique({
      where: { id: positionId },
      select: { id: true }
    });
    return !!position;
  }

  /**
   * Verifica si un candidato tiene application activa
   * @param candidateId ID del candidato
   * @returns true si tiene application, false si no
   */
  async candidateHasActiveApplication(candidateId: number): Promise<boolean> {
    const application = await this.prisma.application.findFirst({
      where: { candidateId },
      select: { id: true }
    });
    return !!application;
  }

  /**
   * Valida si una etapa es válida para la posición del candidato
   * @param candidateId ID del candidato
   * @param stageId ID de la etapa
   * @returns true si es válida, false si no
   */
  async validateStageForCandidate(candidateId: number, stageId: number): Promise<boolean> {
    const application = await this.prisma.application.findFirst({
      where: { candidateId },
      include: {
        position: {
          include: {
            interviewFlow: {
              include: {
                interviewSteps: {
                  select: { id: true }
                }
              }
            }
          }
        }
      }
    });

    if (!application) return false;

    const validStageIds = application.position.interviewFlow.interviewSteps.map((step: any) => step.id);
    return validStageIds.includes(stageId);
  }

  /**
   * Calcula el score promedio de un array de interviews
   * @param interviews Array de interviews con scores
   * @returns Score promedio redondeado a 2 decimales, o null si no hay scores
   */
  private calculateAverageScore(interviews: { score: number | null }[]): number | null {
    const validScores = interviews
      .map(interview => interview.score)
      .filter((score): score is number => score !== null);

    if (validScores.length === 0) {
      return null;
    }

    const average = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
    return Math.round(average * 100) / 100;
  }

  /**
   * Obtiene estadísticas de una posición para metadata
   * @param positionId ID de la posición
   * @returns Metadata de la posición
   */
  async getPositionMetadata(positionId: number) {
    const [candidateCount, position] = await Promise.all([
      this.prisma.application.count({
        where: { positionId }
      }),
      this.prisma.position.findUnique({
        where: { id: positionId },
        select: { title: true, updatedAt: true }
      })
    ]);

    return {
      positionId,
      totalCandidates: candidateCount,
      positionTitle: position?.title || 'Unknown',
      lastUpdated: new Date().toISOString()
    };
  }
}
