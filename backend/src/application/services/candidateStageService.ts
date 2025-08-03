import { prisma } from '../../lib/prisma';
import { CandidateStageDTO } from '../../domain/dtos/CandidateStageDTO';

interface InterviewStep {
    id: number;
    name: string;
    orderIndex: number;
}

export class CandidateStageService {
    /**
     * Advances a candidate to the next interview stage
     * @param candidateId The ID of the candidate to update
     * @returns Promise with the updated stage information
     * @throws Error if candidate not found or no next stage available
     */
    async advanceToNextStage(candidateId: number): Promise<CandidateStageDTO> {
        // Find the current application for the candidate
        const currentApplication = await prisma.application.findFirst({
            where: { candidateId },
            include: {
                position: {
                    include: {
                        interviewFlow: {
                            include: {
                                interviewSteps: {
                                    orderBy: {
                                        orderIndex: 'asc'
                                    }
                                }
                            }
                        }
                    }
                },
                interviewStep: true
            }
        });

        if (!currentApplication) {
            throw new Error('Candidate application not found');
        }

        // Get all steps for the interview flow
        const steps = currentApplication.position.interviewFlow.interviewSteps;
        const currentStepIndex = steps.findIndex((step: InterviewStep) => step.id === currentApplication.currentInterviewStep);

        if (currentStepIndex === -1) {
            throw new Error('Current step not found in interview flow');
        }

        // Check if there's a next step
        if (currentStepIndex === steps.length - 1) {
            throw new Error('Candidate is already in the final stage');
        }

        const nextStep = steps[currentStepIndex + 1];

        // Update the application with the new step
        await prisma.application.update({
            where: { id: currentApplication.id },
            data: {
                currentInterviewStep: nextStep.id
            }
        });

        // Return the updated stage information
        return {
            candidateId,
            currentStage: {
                id: nextStep.id,
                name: nextStep.name
            },
            previousStage: {
                id: steps[currentStepIndex].id,
                name: steps[currentStepIndex].name
            },
            nextStage: currentStepIndex + 2 < steps.length ? {
                id: steps[currentStepIndex + 2].id,
                name: steps[currentStepIndex + 2].name
            } : null,
            updatedAt: new Date()
        };
    }

    /**
     * Gets the current stage information for a candidate
     * @param candidateId The ID of the candidate
     * @returns Promise with the current stage information
     * @throws Error if candidate not found
     */
    async getCurrentStage(candidateId: number): Promise<CandidateStageDTO> {
        const application = await prisma.application.findFirst({
            where: { candidateId },
            include: {
                position: {
                    include: {
                        interviewFlow: {
                            include: {
                                interviewSteps: {
                                    orderBy: {
                                        orderIndex: 'asc'
                                    }
                                }
                            }
                        }
                    }
                },
                interviewStep: true
            }
        });

        if (!application) {
            throw new Error('Candidate application not found');
        }

        const steps = application.position.interviewFlow.interviewSteps;
        const currentStepIndex = steps.findIndex((step: InterviewStep) => step.id === application.currentInterviewStep);

        return {
            candidateId,
            currentStage: {
                id: steps[currentStepIndex].id,
                name: steps[currentStepIndex].name
            },
            previousStage: currentStepIndex > 0 ? {
                id: steps[currentStepIndex - 1].id,
                name: steps[currentStepIndex - 1].name
            } : null,
            nextStage: currentStepIndex < steps.length - 1 ? {
                id: steps[currentStepIndex + 1].id,
                name: steps[currentStepIndex + 1].name
            } : null,
            updatedAt: new Date()
        };
    }
}
