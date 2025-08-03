import { mockPrisma } from '../__mocks__/prisma';
import { PositionService } from '../application/services/positionService';
import { prisma } from '../lib/prisma';

// Mock the prisma instance
jest.mock('../lib/prisma', () => ({
    prisma: mockPrisma
}));

describe('PositionService', () => {
    let service: PositionService;

    beforeEach(() => {
        service = new PositionService();
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('getCandidatesByPosition', () => {
        it('should throw an error when position is not found', async () => {
            // Arrange
            mockPrisma.position.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(service.getCandidatesByPosition(999))
                .rejects
                .toThrow('Position not found');
        });

        it('should return empty candidates array when no applications exist', async () => {
            // Arrange
            mockPrisma.position.findUnique.mockResolvedValue({ id: 1 });
            mockPrisma.application.findMany.mockResolvedValue([]);

            // Act
            const result = await service.getCandidatesByPosition(1);

            // Assert
            expect(result).toEqual({
                positionId: 1,
                candidates: []
            });
        });

        it('should calculate average scores correctly', async () => {
            // Arrange
            mockPrisma.position.findUnique.mockResolvedValue({ id: 1 });
            mockPrisma.application.findMany.mockResolvedValue([
                {
                    candidate: {
                        id: 1,
                        firstName: 'John',
                        lastName: 'Doe'
                    },
                    interviewStep: {
                        name: 'Technical Interview'
                    },
                    interviews: [
                        { score: 85 },
                        { score: 95 }
                    ]
                }
            ]);

            // Act
            const result = await service.getCandidatesByPosition(1);

            // Assert
            expect(result).toEqual({
                positionId: 1,
                candidates: [{
                    id: 1,
                    fullName: 'John Doe',
                    currentInterviewStep: 'Technical Interview',
                    averageScore: 90
                }]
            });
        });

        it('should handle null scores correctly', async () => {
            // Arrange
            mockPrisma.position.findUnique.mockResolvedValue({ id: 1 });
            mockPrisma.application.findMany.mockResolvedValue([
                {
                    candidate: {
                        id: 1,
                        firstName: 'John',
                        lastName: 'Doe'
                    },
                    interviewStep: {
                        name: 'Technical Interview'
                    },
                    interviews: [
                        { score: null },
                        { score: null }
                    ]
                }
            ]);

            // Act
            const result = await service.getCandidatesByPosition(1);

            // Assert
            expect(result.candidates[0].averageScore).toBeNull();
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            mockPrisma.position.findUnique.mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(service.getCandidatesByPosition(1))
                .rejects
                .toThrow('Database error');
        });

        it('should handle invalid position ID', async () => {
            // Act & Assert
            await expect(service.getCandidatesByPosition(-1))
                .rejects
                .toThrow();
        });
    });
});
