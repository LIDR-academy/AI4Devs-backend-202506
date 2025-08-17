import { PrismaClient } from '@prisma/client';
import { validatePositionId } from '../validator';

const prisma = new PrismaClient();

export interface CandidateApplicationInfo {
    candidateId: number;
    fullName: string;
    currentInterviewStep: string;
    averageScore: number | null;
}

export const getCandidatesForPosition = async (positionId: number): Promise<CandidateApplicationInfo[]> => {
    try {
        // Validar el ID de la posición
        validatePositionId(positionId);
        
        // Validar que la posición existe
        const position = await prisma.position.findUnique({
            where: { id: positionId }
        });

        if (!position) {
            throw new Error('Position not found');
        }

        // Obtener todas las aplicaciones para la posición con información del candidato y entrevistas
        const applications = await prisma.application.findMany({
            where: { positionId },
            include: {
                candidate: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                interviewStep: {
                    select: {
                        name: true
                    }
                },
                interviews: {
                    select: {
                        score: true
                    }
                }
            }
        });

        // Transformar los datos para el formato requerido
        const candidatesInfo: CandidateApplicationInfo[] = applications.map(app => {
            // Calcular la puntuación media
            const scores = app.interviews
                .map(interview => interview.score)
                .filter(score => score !== null) as number[];

            const averageScore = scores.length > 0
                ? scores.reduce((sum, score) => sum + score, 0) / scores.length
                : null;

            return {
                candidateId: app.candidate.id,
                fullName: `${app.candidate.firstName} ${app.candidate.lastName}`,
                currentInterviewStep: app.interviewStep.name,
                averageScore: averageScore
            };
        });

        return candidatesInfo;
    } catch (error) {
        console.error('Error getting candidates for position:', error);
        throw error;
    }
}; 