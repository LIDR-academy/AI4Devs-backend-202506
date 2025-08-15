import { KanbanService } from '../../src/application/services/kanbanService';
import { KanbanRepository } from '../../src/infrastructure/database/kanbanRepository';
import { PrismaClient } from '@prisma/client';

// Mock de PrismaClient
const mockPrisma = {
  application: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    count: jest.fn()
  },
  position: {
    findUnique: jest.fn()
  },
  interviewStep: {
    findUnique: jest.fn()
  }
} as unknown as PrismaClient;

describe('KanbanService', () => {
  let kanbanService: KanbanService;
  let kanbanRepository: KanbanRepository;

  beforeEach(() => {
    kanbanService = new KanbanService(mockPrisma);
    kanbanRepository = new KanbanRepository(mockPrisma);
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getCandidatesByPosition', () => {
    const mockPositionId = 1;
    const mockCandidatesData = [
      {
        id: 1,
        fullName: 'Juan Pérez',
        currentInterviewStep: {
          id: 1,
          name: 'Technical Interview',
          orderIndex: 1
        },
        averageScore: 85.5,
        applicationDate: '2025-08-15T10:00:00Z'
      },
      {
        id: 2,
        fullName: 'Ana García',
        currentInterviewStep: {
          id: 2,
          name: 'HR Interview',
          orderIndex: 2
        },
        averageScore: null,
        applicationDate: '2025-08-14T15:30:00Z'
      }
    ];

    const mockMetadata = {
      positionId: 1,
      totalCandidates: 2,
      positionTitle: 'Senior Developer',
      lastUpdated: '2025-08-15T12:00:00Z'
    };

    it('should return candidates successfully when position exists', async () => {
      // Mock position exists
      (mockPrisma.position.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      
      // Mock findCandidatesByPosition
      (mockPrisma.application.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          applicationDate: new Date('2025-08-15T10:00:00Z'),
          currentInterviewStep: 1,
          candidate: { id: 1, firstName: 'Juan', lastName: 'Pérez' },
          interviewStep: { id: 1, name: 'Technical Interview', orderIndex: 1 },
          interviews: [{ score: 80 }, { score: 91 }]
        },
        {
          id: 2,
          applicationDate: new Date('2025-08-14T15:30:00Z'),
          currentInterviewStep: 2,
          candidate: { id: 2, firstName: 'Ana', lastName: 'García' },
          interviewStep: { id: 2, name: 'HR Interview', orderIndex: 2 },
          interviews: []
        }
      ]);

      // Mock metadata
      (mockPrisma.application.count as jest.Mock).mockResolvedValue(2);
      (mockPrisma.position.findUnique as jest.Mock).mockResolvedValue({
        title: 'Senior Developer',
        updatedAt: new Date('2025-08-15T12:00:00Z')
      });

      const result = await kanbanService.getCandidatesByPosition(mockPositionId);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0].fullName).toBe('Juan Pérez');
        expect(result.data[0].averageScore).toBe(85.5);
        expect(result.data[1].averageScore).toBeNull();
        expect(result.meta.totalCandidates).toBe(2);
      }
    });

    it('should return error when position does not exist', async () => {
      // Mock position does not exist
      (mockPrisma.position.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await kanbanService.getCandidatesByPosition(999);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('POS_001');
        expect(result.error.message).toContain('999 no encontrada');
      }
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      (mockPrisma.position.findUnique as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      const result = await kanbanService.getCandidatesByPosition(1);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INTERNAL_ERROR');
      }
    });
  });

  describe('updateCandidateStage', () => {
    const mockCandidateId = 1;
    const mockUpdateData = {
      newStageId: 2,
      notes: 'Moved to next stage'
    };

    it('should update candidate stage successfully', async () => {
      // Mock candidate has active application
      (mockPrisma.application.findFirst as jest.Mock)
        .mockResolvedValueOnce({ id: 1, candidateId: 1 }) // for candidateHasActiveApplication
        .mockResolvedValueOnce({ // for validateStageForCandidate
          position: {
            interviewFlow: {
              interviewSteps: [{ id: 1 }, { id: 2 }, { id: 3 }]
            }
          }
        })
        .mockResolvedValueOnce({ // for updateApplicationStage - current state
          id: 1,
          candidateId: 1,
          interviewStep: { name: 'Technical Interview' }
        });

      // Mock new stage
      (mockPrisma.interviewStep.findUnique as jest.Mock).mockResolvedValue({
        name: 'HR Interview'
      });

      // Mock update
      (mockPrisma.application.update as jest.Mock).mockResolvedValue({
        id: 1,
        updatedAt: new Date('2025-08-15T12:00:00Z')
      });

      const result = await kanbanService.updateCandidateStage(mockCandidateId, mockUpdateData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.candidateId).toBe(1);
        expect(result.data.previousStage).toBe('Technical Interview');
        expect(result.data.newStage).toBe('HR Interview');
        expect(result.message).toContain('movido exitosamente');
      }
    });

    it('should return error when candidate has no active application', async () => {
      // Mock no active application
      (mockPrisma.application.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await kanbanService.updateCandidateStage(mockCandidateId, mockUpdateData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('CAN_001');
      }
    });

    it('should return error when stage is invalid for candidate', async () => {
      // Mock candidate has active application
      (mockPrisma.application.findFirst as jest.Mock)
        .mockResolvedValueOnce({ id: 1, candidateId: 1 }) // for candidateHasActiveApplication
        .mockResolvedValueOnce({ // for validateStageForCandidate - invalid stage
          position: {
            interviewFlow: {
              interviewSteps: [{ id: 1 }, { id: 3 }] // stage 2 not valid
            }
          }
        });

      const result = await kanbanService.updateCandidateStage(mockCandidateId, mockUpdateData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('STG_001');
      }
    });
  });

  describe('validation methods', () => {
    describe('validatePositionId', () => {
      it('should validate valid position ID', () => {
        const result = kanbanService.validatePositionId('123');
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid position ID', () => {
        const result = kanbanService.validatePositionId('abc');
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('número entero positivo');
      });

      it('should reject negative position ID', () => {
        const result = kanbanService.validatePositionId('-1');
        expect(result.isValid).toBe(false);
      });

      it('should reject zero position ID', () => {
        const result = kanbanService.validatePositionId('0');
        expect(result.isValid).toBe(false);
      });
    });

    describe('validateCandidateId', () => {
      it('should validate valid candidate ID', () => {
        const result = kanbanService.validateCandidateId('456');
        expect(result.isValid).toBe(true);
      });

      it('should reject invalid candidate ID', () => {
        const result = kanbanService.validateCandidateId('xyz');
        expect(result.isValid).toBe(false);
      });
    });

    describe('validateUpdateStageRequest', () => {
      it('should validate valid update request', () => {
        const updateData = {
          newStageId: 2,
          notes: 'Optional notes'
        };
        const result = kanbanService.validateUpdateStageRequest(updateData);
        expect(result.isValid).toBe(true);
      });

      it('should validate update request without notes', () => {
        const updateData = {
          newStageId: 2
        };
        const result = kanbanService.validateUpdateStageRequest(updateData);
        expect(result.isValid).toBe(true);
      });

      it('should reject request without newStageId', () => {
        const updateData = {
          notes: 'Some notes'
        };
        const result = kanbanService.validateUpdateStageRequest(updateData);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('newStageId es requerido');
      });

      it('should reject request with invalid newStageId', () => {
        const updateData = {
          newStageId: 'invalid'
        };
        const result = kanbanService.validateUpdateStageRequest(updateData);
        expect(result.isValid).toBe(false);
      });

      it('should reject request with invalid notes type', () => {
        const updateData = {
          newStageId: 2,
          notes: 123
        };
        const result = kanbanService.validateUpdateStageRequest(updateData);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('notes debe ser un string');
      });
    });
  });
});
