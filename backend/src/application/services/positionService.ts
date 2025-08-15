export const getCandidatesByPosition = async (positionId: number, prisma: any) => {
    try {
        const candidates = await prisma.application.findMany({
            where: {
                positionId: positionId
            },
            include: {
                candidate: {
                    include: {
                        educations: true,
                        workExperiences: true,
                        resumes: true
                    }
                },
                interviewStep: true,
                position: {
                    include: {
                        company: true
                    }
                }
            },
            orderBy: {
                applicationDate: 'desc'
            }
        });

        return candidates;
    } catch (error) {
        console.error('Error fetching candidates by position:', error);
        throw new Error('Error al recuperar los candidatos de la posición');
    }
};

export const getAllInterviewSteps = async (prisma: any) => {
    try {
        const interviewSteps = await prisma.interviewStep.findMany({
            orderBy: {
                orderIndex: 'asc'
            },
            include: {
                interviewType: true
            }
        });

        return interviewSteps;
    } catch (error) {
        console.error('Error fetching interview steps:', error);
        throw new Error('Error al recuperar las etapas de entrevista');
    }
};

export const updateCandidateStage = async (candidateId: number, newStageId: number, prisma: any) => {
    try {
        // First verify the candidate exists and has an application
        const application = await prisma.application.findFirst({
            where: {
                candidateId: candidateId
            }
        });

        if (!application) {
            throw new Error('No se encontró una aplicación para este candidato');
        }

        // Verify the new stage exists
        const interviewStep = await prisma.interviewStep.findUnique({
            where: {
                id: newStageId
            }
        });

        if (!interviewStep) {
            throw new Error('La etapa de entrevista especificada no existe');
        }

        // Update the candidate's current interview step
        const updatedApplication = await prisma.application.update({
            where: {
                id: application.id
            },
            data: {
                currentInterviewStep: newStageId
            },
            include: {
                candidate: true,
                interviewStep: true,
                position: true
            }
        });

        return updatedApplication;
    } catch (error) {
        console.error('Error updating candidate stage:', error);
        throw error;
    }
};
