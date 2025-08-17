import { PipelineService } from '../application/services/pipelineService';
import { PrismaClient } from '@prisma/client';

// Import mocks
import './mocks/eventBusMock';
import './mocks/redisCacheMock';
import './mocks/monitoringServiceMock';

// Mock Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    application: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn()
    }
  }))
}));

const mockPrismaClient = {
  application: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn()
  }
};

describe('PipelineService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the static prisma instance in PipelineService
    (PipelineService as any).prisma = mockPrismaClient;
  });

  describe('getCandidatesForPosition', () => {
    it('should return candidates for a valid position', async () => {
      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          candidateId: 1,
          applicationDate: new Date(),
          currentInterviewStep: 1,
          notes: null,
          candidate: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com'
          },
          interviews: [
            { id: 1, score: 85 },
            { id: 2, score: 90 }
          ]
        }
      ];

      mockPrismaClient.application.findMany.mockResolvedValue(mockApplications);

      const result = await PipelineService.getCandidatesForPosition(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        currentInterviewStep: 'Initial Review',
        averageScore: 87.5,
        applicationId: 1,
        positionId: 1,
        appliedDate: mockApplications[0].applicationDate,
        lastUpdated: mockApplications[0].applicationDate
      });
    });

    it('should throw error when no applications found', async () => {
      mockPrismaClient.application.findMany.mockResolvedValue([]);

      await expect(PipelineService.getCandidatesForPosition(999))
        .rejects
        .toThrow('No applications found for position 999');
    });
  });

  describe('updateCandidateStage', () => {
    it('should update candidate stage successfully', async () => {
      const mockApplication = {
        id: 1,
        positionId: 1,
        candidateId: 1,
        applicationDate: new Date(),
        currentInterviewStep: 1,
        notes: null,
        candidate: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        },
        interviews: [
          { id: 1, score: 85 },
          { id: 2, score: 90 }
        ]
      };

      const mockUpdatedApplication = {
        ...mockApplication,
        currentInterviewStep: 2
      };

      mockPrismaClient.application.findFirst.mockResolvedValue(mockApplication);
      mockPrismaClient.application.update.mockResolvedValue(mockUpdatedApplication);

      const result = await PipelineService.updateCandidateStage(1, 'Phone Screen');

      expect(result).toEqual({
        id: 1,
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        currentInterviewStep: 'Phone Screen',
        averageScore: 87.5,
        applicationId: 1,
        positionId: 1,
        appliedDate: mockApplication.applicationDate,
        lastUpdated: mockApplication.applicationDate
      });
    });

    it('should throw error when application not found', async () => {
      mockPrismaClient.application.findFirst.mockResolvedValue(null);

      await expect(PipelineService.updateCandidateStage(999, 'Phone Screen'))
        .rejects
        .toThrow('Application not found for candidate 999');
    });
  });

  describe('getInterviewStepsForPosition', () => {
    it('should return standard interview steps', async () => {
      const result = await PipelineService.getInterviewStepsForPosition(1);

      expect(result).toEqual([
        'Initial Review',
        'Phone Screen',
        'Technical Interview',
        'Final Interview',
        'Offer',
        'Hired',
        'Rejected'
      ]);
    });
  });

  describe('getCandidateById', () => {
    it('should return candidate when found', async () => {
      const mockApplication = {
        id: 1,
        positionId: 1,
        candidateId: 1,
        applicationDate: new Date(),
        currentInterviewStep: 1,
        notes: null,
        candidate: {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        },
        interviews: [
          { id: 1, score: 85 },
          { id: 2, score: 90 }
        ]
      };

      mockPrismaClient.application.findFirst.mockResolvedValue(mockApplication);

      const result = await PipelineService.getCandidateById(1);

      expect(result).toEqual({
        id: 1,
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        currentInterviewStep: 'Initial Review',
        averageScore: 87.5,
        applicationId: 1,
        positionId: 1,
        appliedDate: mockApplication.applicationDate,
        lastUpdated: mockApplication.applicationDate
      });
    });

    it('should return null when candidate not found', async () => {
      mockPrismaClient.application.findFirst.mockResolvedValue(null);

      const result = await PipelineService.getCandidateById(999);

      expect(result).toBeNull();
    });
  });

  describe('getPipelineAnalytics', () => {
    it('should return analytics for a position', async () => {
      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          candidateId: 1,
          applicationDate: new Date(),
          currentInterviewStep: 1,
          notes: null,
          candidate: { id: 1, firstName: 'John', lastName: 'Doe' },
          interviews: [{ id: 1, score: 85 }]
        },
        {
          id: 2,
          positionId: 1,
          candidateId: 2,
          applicationDate: new Date(),
          currentInterviewStep: 2,
          notes: null,
          candidate: { id: 2, firstName: 'Jane', lastName: 'Smith' },
          interviews: [{ id: 2, score: 90 }]
        }
      ];

      mockPrismaClient.application.findMany.mockResolvedValue(mockApplications);

      const result = await PipelineService.getPipelineAnalytics(1, '30d');

      expect(result).toHaveProperty('totalApplications', 2);
      expect(result).toHaveProperty('stageDistribution');
      expect(result).toHaveProperty('averageTimeInStage');
      expect(result).toHaveProperty('conversionRates');
      expect(result).toHaveProperty('timeRange', '30d');
      expect(result).toHaveProperty('positionId', 1);
    });

    it('should return analytics for all positions when no positionId provided', async () => {
      const mockApplications = [
        {
          id: 1,
          positionId: 1,
          candidateId: 1,
          applicationDate: new Date(),
          currentInterviewStep: 1,
          notes: null,
          candidate: { id: 1, firstName: 'John', lastName: 'Doe' },
          interviews: [{ id: 1, score: 85 }]
        }
      ];

      mockPrismaClient.application.findMany.mockResolvedValue(mockApplications);

      const result = await PipelineService.getPipelineAnalytics(undefined, '30d');

      expect(result).toHaveProperty('totalApplications', 1);
      expect(result).toHaveProperty('positionId', undefined);
    });
  });
});
