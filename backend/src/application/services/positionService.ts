import { PrismaClient } from '@prisma/client';
import { CandidateKanbanDTO } from '../dtos/CandidateKanbanDTO';

const prisma = new PrismaClient();

export const positionService = {
  /**
   * Obtiene la lista de candidatos en proceso para una posición, con nombre completo, etapa actual y puntuación media.
   * @param positionId ID de la posición
   * @returns Array de CandidateKanbanDTO
   */
  async getCandidatesByPosition(positionId: number): Promise<CandidateKanbanDTO[]> {
    // 1. Consultar todas las aplicaciones para la posición
    const applications = await prisma.application.findMany({
      where: { positionId },
      include: {
        candidate: true,
        interviews: true,
        interviewStep: true,
      },
    });

    // 2. Mapear a DTO para respuesta Kanban
    return applications.map((app: any): CandidateKanbanDTO => {
      // Calcular puntuación media de entrevistas
      const scores: number[] = app.interviews.map((i: any) => i.score ?? 0).filter((score: number) => typeof score === 'number');
      const averageScore: number | null = scores.length > 0 ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : null;
      return {
        candidateId: app.candidate.id,
        fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
        currentInterviewStep: app.interviewStep?.name || String(app.currentInterviewStep),
        averageScore,
      };
    });
  },
}; 