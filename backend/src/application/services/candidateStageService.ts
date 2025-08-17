import { PrismaClient } from '@prisma/client';
import { validateCandidateStageData } from '../validator';

const prisma = new PrismaClient();

export interface CandidateStageUpdate {
    interviewStepId: number;
    notes?: string;
}

export const updateCandidateStage = async (candidateId: number, stageData: CandidateStageUpdate): Promise<any> => {
    try {
        // Validar los datos de entrada
        validateCandidateStageData(stageData);

        // Verificar que el candidato existe
        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId }
        });

        if (!candidate) {
            throw new Error('Candidate not found');
        }

        // Verificar que la etapa de entrevista existe
        const interviewStep = await prisma.interviewStep.findUnique({
            where: { id: stageData.interviewStepId }
        });

        if (!interviewStep) {
            throw new Error('Interview step not found');
        }

        // Buscar la aplicación activa del candidato (asumiendo que un candidato puede tener múltiples aplicaciones)
        // Por ahora, tomaremos la aplicación más reciente
        const application = await prisma.application.findFirst({
            where: { candidateId },
            orderBy: { applicationDate: 'desc' }
        });

        if (!application) {
            throw new Error('No active application found for this candidate');
        }

        // Actualizar la etapa actual de la aplicación
        const updatedApplication = await prisma.application.update({
            where: { id: application.id },
            data: {
                currentInterviewStep: stageData.interviewStepId,
                notes: stageData.notes || application.notes
            },
            include: {
                interviewStep: {
                    select: {
                        id: true,
                        name: true,
                        orderIndex: true
                    }
                },
                candidate: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        return {
            candidateId: updatedApplication.candidate.id,
            candidateName: `${updatedApplication.candidate.firstName} ${updatedApplication.candidate.lastName}`,
            currentStage: {
                id: updatedApplication.interviewStep.id,
                name: updatedApplication.interviewStep.name,
                orderIndex: updatedApplication.interviewStep.orderIndex
            },
            notes: updatedApplication.notes,
            updatedAt: updatedApplication.applicationDate
        };
    } catch (error) {
        console.error('Error updating candidate stage:', error);
        throw error;
    }
};

export const getCandidateCurrentStage = async (candidateId: number): Promise<any> => {
    try {
        // Verificar que el candidato existe
        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId }
        });

        if (!candidate) {
            throw new Error('Candidate not found');
        }

        // Obtener la aplicación más reciente del candidato
        const application = await prisma.application.findFirst({
            where: { candidateId },
            orderBy: { applicationDate: 'desc' },
            include: {
                interviewStep: {
                    select: {
                        id: true,
                        name: true,
                        orderIndex: true
                    }
                },
                position: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        if (!application) {
            throw new Error('No active application found for this candidate');
        }

        return {
            candidateId: candidate.id,
            candidateName: `${candidate.firstName} ${candidate.lastName}`,
            currentStage: {
                id: application.interviewStep.id,
                name: application.interviewStep.name,
                orderIndex: application.interviewStep.orderIndex
            },
            position: {
                id: application.position.id,
                title: application.position.title
            },
            notes: application.notes
        };
    } catch (error) {
        console.error('Error getting candidate current stage:', error);
        throw error;
    }
}; 