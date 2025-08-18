import { PositionService } from '../application/services/positionService';

// Mock PrismaClient
const mockPrismaClient = {
  position: {
    findUnique: jest.fn()
  },
  application: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn()
  },
  candidate: {
    findUnique: jest.fn()
  },
  interviewStep: {
    findUnique: jest.fn()
  }
};

describe('PositionService', () => {
  let positionService: PositionService;

  beforeEach(() => {
    jest.clearAllMocks();
    positionService = new PositionService(mockPrismaClient as any);
  });

  describe('getCandidatesForPosition', () => {
    it('should return candidates for a valid position', async () => {
      // Arrange
      const positionId = 1;
      const mockPosition = {
        id: 1,
        title: 'Software Engineer',
        interviewFlow: {
          interviewSteps: [
            { id: 1, name: 'Initial Screening' },
            { id: 2, name: 'Technical Interview' }
          ]
        }
      };

      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          candidate: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe'
          },
          interviewStep: {
            id: 1,
            name: 'Initial Screening'
          },
          interviews: [
            { score: 8 },
            { score: 9 }
          ]
        },
        {
          id: 2,
          positionId: 1,
          candidate: {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith'
          },
          interviewStep: {
            id: 2,
            name: 'Technical Interview'
          },
          interviews: [
            { score: 7 },
            { score: 6 }
          ]
        }
      ];

      mockPrismaClient.position.findUnique.mockResolvedValue(mockPosition);
      mockPrismaClient.application.findMany.mockResolvedValue(mockApplications);

      // Act
      const result = await positionService.getCandidatesForPosition(positionId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        fullName: 'John Doe',
        currentInterviewStep: 'Initial Screening',
        averageScore: 8.5,
        applicationId: 1,
        positionId: 1
      });
      expect(result[1]).toEqual({
        id: 2,
        fullName: 'Jane Smith',
        currentInterviewStep: 'Technical Interview',
        averageScore: 6.5,
        applicationId: 2,
        positionId: 1
      });
    });

    it('should return empty array when no applications found', async () => {
      // Arrange
      const positionId = 1;
      const mockPosition = {
        id: 1,
        title: 'Software Engineer',
        interviewFlow: {
          interviewSteps: []
        }
      };

      mockPrismaClient.position.findUnique.mockResolvedValue(mockPosition);
      mockPrismaClient.application.findMany.mockResolvedValue([]);

      // Act
      const result = await positionService.getCandidatesForPosition(positionId);

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should handle candidates with no interviews', async () => {
      // Arrange
      const positionId = 1;
      const mockPosition = {
        id: 1,
        title: 'Software Engineer',
        interviewFlow: {
          interviewSteps: [
            { id: 1, name: 'Initial Screening' }
          ]
        }
      };

      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          candidate: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe'
          },
          interviewStep: {
            id: 1,
            name: 'Initial Screening'
          },
          interviews: []
        }
      ];

      mockPrismaClient.position.findUnique.mockResolvedValue(mockPosition);
      mockPrismaClient.application.findMany.mockResolvedValue(mockApplications);

      // Act
      const result = await positionService.getCandidatesForPosition(positionId);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].averageScore).toBe(0);
    });

    it('should throw error when position not found', async () => {
      // Arrange
      const positionId = 999;
      mockPrismaClient.position.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(positionService.getCandidatesForPosition(positionId))
        .rejects
        .toThrow('Position with ID 999 not found');
    });
  });

  describe('updateCandidateStage', () => {
    it('should successfully update candidate stage', async () => {
      // Arrange
      const candidateId = 1;
      const newInterviewStepId = 2;
      const positionId = 1;

      const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };
      const mockInterviewStep = { id: 2, name: 'Technical Interview' };
      const mockApplication = {
        id: 1,
        candidateId: 1,
        positionId: 1,
        position: { title: 'Software Engineer' },
        interviewStep: { id: 1, name: 'Initial Screening' }
      };

      const mockUpdatedApplication = {
        id: 1,
        candidateId: 1,
        positionId: 1,
        candidate: { firstName: 'John', lastName: 'Doe' },
        position: { title: 'Software Engineer' },
        interviewStep: { id: 2, name: 'Technical Interview' }
      };

      mockPrismaClient.candidate.findUnique.mockResolvedValue(mockCandidate);
      mockPrismaClient.interviewStep.findUnique.mockResolvedValue(mockInterviewStep);
      mockPrismaClient.application.findFirst.mockResolvedValue(mockApplication);
      mockPrismaClient.application.update.mockResolvedValue(mockUpdatedApplication);

      // Act
      const result = await positionService.updateCandidateStage(candidateId, newInterviewStepId, positionId);

      // Assert
      expect(result.message).toBe('Candidate stage updated successfully');
      expect(result.data.candidateId).toBe(candidateId);
      expect(result.data.newStage).toBe('Technical Interview');
      expect(result.data.previousStage).toBe('Initial Screening');
    });

    it('should throw error when candidate not found', async () => {
      // Arrange
      const candidateId = 999;
      const newInterviewStepId = 2;
      const positionId = 1;

      mockPrismaClient.candidate.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(positionService.updateCandidateStage(candidateId, newInterviewStepId, positionId))
        .rejects
        .toThrow('Candidate with ID 999 not found');
    });

    it('should throw error when interview step not found', async () => {
      // Arrange
      const candidateId = 1;
      const newInterviewStepId = 999;
      const positionId = 1;

      const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };
      mockPrismaClient.candidate.findUnique.mockResolvedValue(mockCandidate);
      mockPrismaClient.interviewStep.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(positionService.updateCandidateStage(candidateId, newInterviewStepId, positionId))
        .rejects
        .toThrow('Interview step with ID 999 not found');
    });

    it('should throw error when no application found for candidate', async () => {
      // Arrange
      const candidateId = 999;
      const newInterviewStepId = 1;
      const positionId = 1;

      const mockCandidate = { id: 999, firstName: 'Unknown', lastName: 'Person' };
      const mockInterviewStep = { id: 1, name: 'Initial Screening' };

      mockPrismaClient.candidate.findUnique.mockResolvedValue(mockCandidate);
      mockPrismaClient.interviewStep.findUnique.mockResolvedValue(mockInterviewStep);
      mockPrismaClient.application.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(positionService.updateCandidateStage(candidateId, newInterviewStepId, positionId))
        .rejects
        .toThrow('No application found for candidate 999 in position 1');
    });
  });
});
