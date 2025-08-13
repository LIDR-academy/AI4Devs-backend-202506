import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCandidatesByPositionService = async (positionId: number) => {
    // Busca todas las aplicaciones para la posición dada, incluyendo candidato e interviews
    const applications = await prisma.application.findMany({
        where: { positionId },
        include: {
            candidate: true,
            interviews: true
        }
    });

    // Mapea la información requerida para el kanban
    return applications.map(app => {
        const fullName = `${app.candidate.firstName} ${app.candidate.lastName}`;
        const currentInterviewStep = app.currentInterviewStep;
        let avgScore = null;
        if (app.interviews && app.interviews.length > 0) {
            const scores = app.interviews.map(i => i.score).filter(s => typeof s === 'number');
            if (scores.length > 0) {
                avgScore = scores.reduce((a, b) => a + (b ?? 0), 0) / scores.length;
            }
        }
        return {
            candidateName: fullName,
            current_interview_step: currentInterviewStep,
            average_score: avgScore
        };
    });
};
