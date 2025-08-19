import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CandidateInPosition {
    candidateId: number;
    fullName: string;
    currentInterviewStep: number;
    currentInterviewStepName: string;
    averageScore: number | null;
    applicationId: number;
}

/**
 * Get all candidates in process for a specific position
 * Returns candidate information for Kanban interface
 */
export const getCandidatesByPosition = async (positionId: number): Promise<CandidateInPosition[]> => {
    try {
        // Validate position exists
        const position = await prisma.position.findUnique({
            where: { id: positionId }
        });

        if (!position) {
            throw new Error(`Position with ID ${positionId} not found`);
        }

        // Get all applications for this position with candidate and interview data
        const applications = await prisma.application.findMany({
            where: {
                positionId: positionId
            },
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
                        score: {
                            not: null
                        }
                    }
                }
            }
        });

        // Validate if there are applications for this position
        if (applications.length === 0) {
            return [];
        }

        // Transform data for Kanban interface
        const candidates: CandidateInPosition[] = applications.map((application: any) => {
            // Calculate average score from interviews
            const scores = application.interviews
                .map((interview: any) => interview.score)
                .filter((score: any): score is number => score !== null);
            
            const averageScore = scores.length > 0 
                ? Math.round((scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length) * 100) / 100
                : null;

            return {
                candidateId: application.candidate.id,
                fullName: `${application.candidate.firstName} ${application.candidate.lastName}`,
                currentInterviewStep: application.currentInterviewStep,
                currentInterviewStepName: application.interviewStep.name,
                averageScore: averageScore,
                applicationId: application.id
            };
        });

        return candidates;

    } catch (error) {
        console.error('Error getting candidates by position:', error);
        throw error;
    }
};

/**
 * Update the current interview step for a candidate
 */
export const updateCandidateStage = async (candidateId: number, newStageId: number): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
        // Validate that the candidate exists
        const candidate = await prisma.candidate.findUnique({
            where: { id: candidateId }
        });

        if (!candidate) {
            throw new Error(`Candidate with ID ${candidateId} not found`);
        }

        // Validate that the interview step exists
        const interviewStep = await prisma.interviewStep.findUnique({
            where: { id: newStageId }
        });

        if (!interviewStep) {
            throw new Error(`Interview step with ID ${newStageId} not found`);
        }

        // Find the most recent application for this candidate
        const application = await prisma.application.findFirst({
            where: {
                candidateId: candidateId
            },
            orderBy: {
                applicationDate: 'desc'
            },
            include: {
                position: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                interviewStep: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!application) {
            throw new Error(`No application found for candidate with ID ${candidateId}`);
        }

        // Check if the candidate is already in the requested stage
        if (application.currentInterviewStep === newStageId) {
            return {
                success: true,
                message: `Candidate is already in stage "${interviewStep.name}"`,
                data: {
                    candidateId: candidateId,
                    candidateName: `${candidate.firstName} ${candidate.lastName}`,
                    currentStageId: newStageId,
                    currentStageName: interviewStep.name,
                    positionId: application.position.id,
                    positionTitle: application.position.title
                }
            };
        }

        // Update the current interview step
        await prisma.application.update({
            where: {
                id: application.id
            },
            data: {
                currentInterviewStep: newStageId
            }
        });

        return {
            success: true,
            message: `Candidate stage updated successfully from "${application.interviewStep.name}" to "${interviewStep.name}"`,
            data: {
                candidateId: candidateId,
                candidateName: `${candidate.firstName} ${candidate.lastName}`,
                previousStageId: application.currentInterviewStep,
                previousStageName: application.interviewStep.name,
                newStageId: newStageId,
                newStageName: interviewStep.name,
                positionId: application.position.id,
                positionTitle: application.position.title
            }
        };

    } catch (error) {
        console.error('Error updating candidate stage:', error);
        throw error;
    }
};
