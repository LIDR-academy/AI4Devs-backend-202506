import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Obtiene todos los candidatos en proceso para una posición específica
 * con información consolidada incluyendo nombre completo, etapa actual y puntuación media
 */
export const getCandidatesByPosition = async (positionId: number) => {
    try {
        // Validar que la posición existe
        const position = await prisma.position.findUnique({
            where: { id: positionId }
        });

        if (!position) {
            throw new Error('Position not found');
        }

        // Obtener todas las aplicaciones para la posición con información del candidato
        const applications = await prisma.application.findMany({
            where: { positionId: positionId },
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

        // Procesar cada aplicación para obtener la información consolidada
        const candidatesData = applications.map(application => {
            // Calcular el nombre completo
            const fullName = `${application.candidate.firstName} ${application.candidate.lastName}`;
            
            // Obtener la etapa actual
            const currentInterviewStep = application.interviewStep.name;
            
            // Calcular la puntuación media de las entrevistas
            const scores = application.interviews
                .map(interview => interview.score)
                .filter(score => score !== null) as number[];
            
            const averageScore = scores.length > 0 
                ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
                : 0;

            return {
                full_name: fullName,
                current_interview_step: currentInterviewStep,
                average_score: Math.round(averageScore * 10) / 10 // Redondear a 1 decimal
            };
        });

        return candidatesData;
    } catch (error) {
        console.error('Error getting candidates by position:', error);
        throw error;
    }
};

/**
 * Actualiza la etapa del proceso de entrevista para un candidato específico
 */
export const updateCandidateStage = async (candidateId: number, newStageId: number) => {
    try {
        // Validar que el candidato existe
        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId }
        });

        if (!candidate) {
            throw new Error('Candidate not found');
        }

        // Validar que la nueva etapa existe
        const interviewStep = await prisma.interviewStep.findUnique({
            where: { id: newStageId }
        });

        if (!interviewStep) {
            throw new Error('Interview step not found');
        }

        // Buscar la aplicación activa del candidato
        const application = await prisma.application.findFirst({
            where: { candidateId: candidateId },
            include: {
                interviewStep: {
                    select: {
                        name: true
                    }
                }
            }
        });

        if (!application) {
            throw new Error('No active application found for this candidate');
        }

        // Actualizar la etapa actual de la aplicación
        const updatedApplication = await prisma.application.update({
            where: { id: application.id },
            data: { currentInterviewStep: newStageId },
            include: {
                interviewStep: {
                    select: {
                        name: true
                    }
                }
            }
        });

        return {
            candidate_id: candidateId,
            updated_stage: updatedApplication.interviewStep.name,
            status: 'success'
        };
    } catch (error) {
        console.error('Error updating candidate stage:', error);
        throw error;
    }
};
