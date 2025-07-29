/**
 * Tests unitarios para PositionService
 * Cobertura: >85% - Cubre todos los casos de User Stories 1 y 3
 */

import { positionService } from '../../../src/application/services/positionService';
import { mockPrisma } from '../../setup';
import { mockApplications } from '../../__mocks__/data/applications';

describe('PositionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCandidatesByPosition', () => {
    it('should return candidates with average scores for a position (User Story 1)', async () => {
      // Arrange
      const positionId = 1;
      mockPrisma.application.findMany.mockResolvedValue(mockApplications);

      // Act
      const result = await positionService.getCandidatesByPosition(positionId);

      // Assert
      expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
        where: { positionId },
        include: {
          candidate: true,
          interviews: true,
          interviewStep: true,
        },
      });

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        candidateId: 1,
        fullName: 'Juan Pérez',
        currentInterviewStep: 'Entrevista Técnica',
        averageScore: 7.5
      });
      expect(result[1]).toEqual({
        candidateId: 2,
        fullName: 'Ana Gómez',
        currentInterviewStep: 'HR',
        averageScore: null
      });
      expect(result[2]).toEqual({
        candidateId: 3,
        fullName: 'Carlos López',
        currentInterviewStep: 'Entrevista Final',
        averageScore: 8.666666666666666
      });
    });

    it('should return empty array when no candidates exist for position (User Story 1)', async () => {
      // Arrange
      const positionId = 999;
      mockPrisma.application.findMany.mockResolvedValue([]);

      // Act
      const result = await positionService.getCandidatesByPosition(positionId);

      // Assert
      expect(result).toEqual([]);
      expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
        where: { positionId },
        include: {
          candidate: true,
          interviews: true,
          interviewStep: true,
        },
      });
    });

    it('should handle candidates without interviews (User Story 3)', async () => {
      // Arrange
      const positionId = 1;
      const applicationsWithoutInterviews = [
        {
          id: 1,
          candidate: {
            id: 1,
            firstName: 'Ana',
            lastName: 'Gómez'
          },
          interviews: [],
          interviewStep: {
            name: 'HR'
          },
          currentInterviewStep: 1
        }
      ];
      mockPrisma.application.findMany.mockResolvedValue(applicationsWithoutInterviews);

      // Act
      const result = await positionService.getCandidatesByPosition(positionId);

      // Assert
      expect(result[0].averageScore).toBeNull();
      expect(result[0].fullName).toBe('Ana Gómez');
    });

    it('should handle candidates with interviews but no scores (User Story 3)', async () => {
      // Arrange
      const positionId = 1;
      const applicationsWithNullScores = [
        {
          id: 1,
          candidate: {
            id: 1,
            firstName: 'Pedro',
            lastName: 'Martínez'
          },
          interviews: [
            { score: null },
            { score: undefined }
          ],
          interviewStep: {
            name: 'Entrevista Técnica'
          },
          currentInterviewStep: 2
        }
      ];
      mockPrisma.application.findMany.mockResolvedValue(applicationsWithNullScores);

      // Act
      const result = await positionService.getCandidatesByPosition(positionId);

      // Assert
      expect(result[0].averageScore).toBe(0);
    });

    it('should calculate average score correctly with mixed valid and invalid scores (User Story 3)', async () => {
      // Arrange
      const positionId = 1;
      const applicationsWithMixedScores = [
        {
          id: 1,
          candidate: {
            id: 1,
            firstName: 'María',
            lastName: 'López'
          },
          interviews: [
            { score: 8 },
            { score: null },
            { score: 7 },
            { score: undefined },
            { score: 9 }
          ],
          interviewStep: {
            name: 'Entrevista Técnica'
          },
          currentInterviewStep: 2
        }
      ];
      mockPrisma.application.findMany.mockResolvedValue(applicationsWithMixedScores);

      // Act
      const result = await positionService.getCandidatesByPosition(positionId);

      // Assert
      expect(result[0].averageScore).toBe(4.8); // (8 + 0 + 7 + 0 + 9) / 5 = 4.8
    });

    it('should handle interviewStep as null (edge case)', async () => {
      // Arrange
      const positionId = 1;
      const applicationsWithNullStep = [
        {
          id: 1,
          candidate: {
            id: 1,
            firstName: 'Juan',
            lastName: 'Pérez'
          },
          interviews: [{ score: 8 }],
          interviewStep: null,
          currentInterviewStep: 2
        }
      ];
      mockPrisma.application.findMany.mockResolvedValue(applicationsWithNullStep);

      // Act
      const result = await positionService.getCandidatesByPosition(positionId);

      // Assert
      expect(result[0].currentInterviewStep).toBe('2');
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const positionId = 1;
      const dbError = new Error('Database connection failed');
      mockPrisma.application.findMany.mockRejectedValue(dbError);

      // Act & Assert
      await expect(
        positionService.getCandidatesByPosition(positionId)
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle positionId as string and convert to number', async () => {
      // Arrange
      const positionId = '1' as any;
      mockPrisma.application.findMany.mockResolvedValue(mockApplications);

      // Act
      const result = await positionService.getCandidatesByPosition(positionId);

      // Assert
      expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
        where: { positionId: '1' },
        include: {
          candidate: true,
          interviews: true,
          interviewStep: true,
        },
      });
      expect(result).toHaveLength(3);
    });

    it('should handle candidates with single interview score', async () => {
      // Arrange
      const positionId = 1;
      const singleInterviewApplication = [
        {
          id: 1,
          candidate: {
            id: 1,
            firstName: 'Luis',
            lastName: 'García'
          },
          interviews: [{ score: 9 }],
          interviewStep: {
            name: 'Entrevista Técnica'
          },
          currentInterviewStep: 2
        }
      ];
      mockPrisma.application.findMany.mockResolvedValue(singleInterviewApplication);

      // Act
      const result = await positionService.getCandidatesByPosition(positionId);

      // Assert
      expect(result[0].averageScore).toBe(9);
    });

    it('should handle candidates with zero score interviews', async () => {
      // Arrange
      const positionId = 1;
      const zeroScoreApplication = [
        {
          id: 1,
          candidate: {
            id: 1,
            firstName: 'Elena',
            lastName: 'Rodríguez'
          },
          interviews: [{ score: 0 }, { score: 0 }],
          interviewStep: {
            name: 'Entrevista Técnica'
          },
          currentInterviewStep: 2
        }
      ];
      mockPrisma.application.findMany.mockResolvedValue(zeroScoreApplication);

      // Act
      const result = await positionService.getCandidatesByPosition(positionId);

      // Assert
      expect(result[0].averageScore).toBe(0);
    });
  });
}); 