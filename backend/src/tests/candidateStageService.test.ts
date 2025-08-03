import { mockPrisma } from '../__mocks__/prisma';
import { CandidateStageService } from '../application/services/candidateStageService';
import { prisma } from '../lib/prisma';

// Mock the prisma instance
jest.mock('../lib/prisma', () => ({
    prisma: mockPrisma
}));

describe('CandidateStageService', () => {
    let service: CandidateStageService;

    beforeEach(() => {
        service = new CandidateStageService();
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('advanceToNextStage', () => {
        it('should throw an error when candidate application is not found', async () => {
            // Arrange
            mockPrisma.application.findFirst.mockResolvedValue(null);

            // Act & Assert
            await expect(service.advanceToNextStage(999))
                .rejects
                .toThrow('Candidate application not found');
        });

        it('should advance candidate to next stage successfully', async () => {
            // Arrange
            const mockApplication = {
                id: 1,
                currentInterviewStep: 1,
                position: {
                    interviewFlow: {
                        interviewSteps: [
                            { id: 1, name: 'Initial Interview', orderIndex: 1 },
                            { id: 2, name: 'Technical Interview', orderIndex: 2 },
                            { id: 3, name: 'Final Interview', orderIndex: 3 }
                        ]
                    }
                },
                interviewStep: { id: 1, name: 'Initial Interview' }
            };

            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
            mockPrisma.application.update.mockResolvedValue({
                ...mockApplication,
                currentInterviewStep: 2
            });

            // Act
            const result = await service.advanceToNextStage(1);

            // Assert
            expect(result).toEqual({
                candidateId: 1,
                currentStage: {
                    id: 2,
                    name: 'Technical Interview'
                },
                previousStage: {
                    id: 1,
                    name: 'Initial Interview'
                },
                nextStage: {
                    id: 3,
                    name: 'Final Interview'
                },
                updatedAt: expect.any(Date)
            });
        });

        it('should throw error when candidate is in final stage', async () => {
            // Arrange
            const mockApplication = {
                id: 1,
                currentInterviewStep: 3,
                position: {
                    interviewFlow: {
                        interviewSteps: [
                            { id: 1, name: 'Initial Interview', orderIndex: 1 },
                            { id: 2, name: 'Technical Interview', orderIndex: 2 },
                            { id: 3, name: 'Final Interview', orderIndex: 3 }
                        ]
                    }
                },
                interviewStep: { id: 3, name: 'Final Interview' }
            };

            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);

            // Act & Assert
            await expect(service.advanceToNextStage(1))
                .rejects
                .toThrow('Candidate is already in the final stage');
        });
    });

    describe('getCurrentStage', () => {
        it('should return current stage information', async () => {
            // Arrange
            const mockApplication = {
                id: 1,
                currentInterviewStep: 2,
                position: {
                    interviewFlow: {
                        interviewSteps: [
                            { id: 1, name: 'Initial Interview', orderIndex: 1 },
                            { id: 2, name: 'Technical Interview', orderIndex: 2 },
                            { id: 3, name: 'Final Interview', orderIndex: 3 }
                        ]
                    }
                },
                interviewStep: { id: 2, name: 'Technical Interview' }
            };

            mockPrisma.application.findFirst.mockResolvedValue(mockApplication);

            // Act
            const result = await service.getCurrentStage(1);

            // Assert
            expect(result).toEqual({
                candidateId: 1,
                currentStage: {
                    id: 2,
                    name: 'Technical Interview'
                },
                previousStage: {
                    id: 1,
                    name: 'Initial Interview'
                },
                nextStage: {
                    id: 3,
                    name: 'Final Interview'
                },
                updatedAt: expect.any(Date)
            });
        });

        it('should handle invalid candidate ID', async () => {
            // Arrange
            mockPrisma.application.findFirst.mockResolvedValue(null);

            // Act & Assert
            await expect(service.getCurrentStage(-1))
                .rejects
                .toThrow('Candidate application not found');
        });
    });
});
