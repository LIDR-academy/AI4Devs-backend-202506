import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Interfaces TypeScript para la respuesta
export interface InterviewStepInfo {
  id: number;
  name: string;
  orderIndex: number;
}

export interface CandidatePositionInfo {
  candidateId: number;
  fullName: string;
  email: string;
  currentInterviewStep: InterviewStepInfo;
  averageScore: number | null;
  totalInterviews: number;
  applicationDate: string;
}

export interface PositionCandidatesResponse {
  positionId: number;
  positionTitle: string;
  totalCandidates: number;
  candidates: CandidatePositionInfo[];
}

/**
 * Servicio para obtener todos los candidatos de una posición específica
 * @param positionId - ID de la posición
 * @returns Información de candidatos o null si la posición no existe
 */
export const getCandidatesByPositionId = async (
  positionId: number
): Promise<PositionCandidatesResponse | null> => {
  try {
    // Paso 1: Verificar que la posición existe
    const position = await prisma.position.findUnique({
      where: { id: positionId },
      select: { id: true, title: true }
    });

    if (!position) {
      return null;
    }

    // Paso 2: Obtener todas las aplicaciones de la posición con datos relacionados
    const applications = await prisma.application.findMany({
      where: { positionId: positionId },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
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
          }
        }
      },
      orderBy: {
        applicationDate: 'desc'
      }
    });

    // Paso 3: Transformar y procesar los datos
    const candidates: CandidatePositionInfo[] = applications.map(application => {
      // Calcular puntuación media
      const validScores = application.interviews
        .map(interview => interview.score)
        .filter((score): score is number => score !== null);
      
      const averageScore = validScores.length > 0 
        ? Math.round((validScores.reduce((sum, score) => sum + score, 0) / validScores.length) * 10) / 10
        : null;

      return {
        candidateId: application.candidate.id,
        fullName: `${application.candidate.firstName} ${application.candidate.lastName}`,
        email: application.candidate.email,
        currentInterviewStep: {
          id: application.interviewStep.id,
          name: application.interviewStep.name,
          orderIndex: application.interviewStep.orderIndex
        },
        averageScore,
        totalInterviews: application.interviews.length,
        applicationDate: application.applicationDate.toISOString()
      };
    });

    // Paso 4: Estructurar respuesta final
    return {
      positionId: position.id,
      positionTitle: position.title,
      totalCandidates: candidates.length,
      candidates
    };

  } catch (error) {
    console.error('Error en getCandidatesByPositionId:', error);
    throw error;
  }
};
