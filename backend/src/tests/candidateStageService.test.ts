import { updateCandidateStage } from '../application/services/candidateService';
import { StageUpdateRequest } from '../domain/models/ApplicationStage';

// Mock de Prisma
const mockPrisma = {
  candidate: {
    findUnique: jest.fn(),
  },
  application: {
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  interviewStep: {
    findFirst: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

describe('Candidate Service - updateCandidateStage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Verificación de candidato existente', () => {
    it('debe retornar null cuando el candidato no existe', async () => {
      mockPrisma.candidate.findUnique.mockResolvedValue(null);

      const stageUpdateData: StageUpdateRequest = { newStage: 'Technical Interview' };
      const result = await updateCandidateStage(999, stageUpdateData);

      expect(result).toBeNull();
      expect(mockPrisma.candidate.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        select: { id: true, firstName: true, lastName: true }
      });
    });
  });

  describe('Procesamiento de candidatos exitoso', () => {
    it('debe actualizar la etapa y retornar información completa', async () => {
      const mockCandidate = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe'
      };

      const mockApplication = {
        id: 1,
        position: {
          id: 1,
          title: 'Software Engineer',
          interviewFlowId: 1
        },
        interviewStep: {
          id: 1,
          name: 'Initial Screening',
          orderIndex: 1
        }
      };

      const mockNewInterviewStep = {
        id: 2,
        name: 'Technical Interview',
        orderIndex: 2
      };

      const mockUpdatedApplication = {
        id: 1,
        position: {
          title: 'Software Engineer'
        }
      };

      mockPrisma.candidate.findUnique.mockResolvedValue(mockCandidate);
      mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
      mockPrisma.interviewStep.findFirst.mockResolvedValue(mockNewInterviewStep);
      mockPrisma.application.update.mockResolvedValue(mockUpdatedApplication);

      const stageUpdateData: StageUpdateRequest = {
        newStage: 'Technical Interview',
        notes: 'Candidate passed initial screening'
      };

      const result = await updateCandidateStage(1, stageUpdateData);

      expect(result).toEqual({
        candidateId: 1,
        applicationId: 1,
        candidateName: 'John Doe',
        positionTitle: 'Software Engineer',
        previousStage: {
          id: 1,
          name: 'Initial Screening',
          orderIndex: 1
        },
        currentStage: {
          id: 2,
          name: 'Technical Interview',
          orderIndex: 2
        },
        updatedAt: expect.any(String),
        notes: 'Candidate passed initial screening'
      });
    });

    it('debe funcionar sin notas proporcionadas', async () => {
      const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };
      const mockApplication = {
        id: 1,
        notes: 'Previous notes',
        position: { id: 1, title: 'Software Engineer', interviewFlowId: 1 },
        interviewStep: { id: 1, name: 'Initial Screening', orderIndex: 1 }
      };
      const mockNewInterviewStep = { id: 2, name: 'Technical Interview', orderIndex: 2 };
      const mockUpdatedApplication = { id: 1, position: { title: 'Software Engineer' } };

      mockPrisma.candidate.findUnique.mockResolvedValue(mockCandidate);
      mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
      mockPrisma.interviewStep.findFirst.mockResolvedValue(mockNewInterviewStep);
      mockPrisma.application.update.mockResolvedValue(mockUpdatedApplication);

      const stageUpdateData: StageUpdateRequest = { newStage: 'Technical Interview' };
      const result = await updateCandidateStage(1, stageUpdateData);

      expect(result?.notes).toBeUndefined();
      expect(mockPrisma.application.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          currentInterviewStep: 2,
          notes: 'Previous notes' // Mantiene las notas anteriores
        },
        include: {
          position: {
            select: { title: true }
          }
        }
      });
    });
  });

  describe('Validaciones de negocio', () => {
    it('debe lanzar NO_ACTIVE_APPLICATION cuando el candidato no tiene aplicaciones', async () => {
      const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };

      mockPrisma.candidate.findUnique.mockResolvedValue(mockCandidate);
      mockPrisma.application.findFirst.mockResolvedValue(null);

      const stageUpdateData: StageUpdateRequest = { newStage: 'Technical Interview' };

      await expect(updateCandidateStage(1, stageUpdateData))
        .rejects.toThrow('NO_ACTIVE_APPLICATION');
    });

    it('debe lanzar INVALID_STAGE cuando la nueva etapa no existe en el flujo', async () => {
      const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };
      const mockApplication = {
        id: 1,
        position: { id: 1, title: 'Software Engineer', interviewFlowId: 1 },
        interviewStep: { id: 1, name: 'Initial Screening', orderIndex: 1 }
      };

      mockPrisma.candidate.findUnique.mockResolvedValue(mockCandidate);
      mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
      mockPrisma.interviewStep.findFirst.mockResolvedValue(null);

      const stageUpdateData: StageUpdateRequest = { newStage: 'Invalid Stage' };

      await expect(updateCandidateStage(1, stageUpdateData))
        .rejects.toThrow('INVALID_STAGE');
    });
  });

  describe('Consultas de base de datos', () => {
    it('debe realizar las consultas con los parámetros correctos', async () => {
      const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };
      const mockApplication = {
        id: 1,
        position: { id: 1, title: 'Software Engineer', interviewFlowId: 1 },
        interviewStep: { id: 1, name: 'Initial Screening', orderIndex: 1 }
      };
      const mockNewInterviewStep = { id: 2, name: 'Technical Interview', orderIndex: 2 };
      const mockUpdatedApplication = { id: 1, position: { title: 'Software Engineer' } };

      mockPrisma.candidate.findUnique.mockResolvedValue(mockCandidate);
      mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
      mockPrisma.interviewStep.findFirst.mockResolvedValue(mockNewInterviewStep);
      mockPrisma.application.update.mockResolvedValue(mockUpdatedApplication);

      const stageUpdateData: StageUpdateRequest = { newStage: 'Technical Interview' };
      await updateCandidateStage(1, stageUpdateData);

      // Verificar consulta de candidato
      expect(mockPrisma.candidate.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { id: true, firstName: true, lastName: true }
      });

      // Verificar consulta de aplicación
      expect(mockPrisma.application.findFirst).toHaveBeenCalledWith({
        where: { candidateId: 1 },
        orderBy: { applicationDate: 'desc' },
        include: {
          position: {
            select: { 
              id: true, 
              title: true, 
              interviewFlowId: true 
            }
          },
          interviewStep: {
            select: {
              id: true,
              name: true,
              orderIndex: true
            }
          }
        }
      });

      // Verificar consulta de nueva etapa
      expect(mockPrisma.interviewStep.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'Technical Interview',
          interviewFlowId: 1
        },
        select: {
          id: true,
          name: true,
          orderIndex: true
        }
      });

      // Verificar actualización
      expect(mockPrisma.application.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          currentInterviewStep: 2,
          notes: undefined // Sin notas anteriores
        },
        include: {
          position: {
            select: { title: true }
          }
        }
      });
    });
  });

  describe('Manejo de errores', () => {
    it('debe propagar errores específicos de negocio', async () => {
      const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };

      mockPrisma.candidate.findUnique.mockResolvedValue(mockCandidate);
      mockPrisma.application.findFirst.mockResolvedValue(null);

      const stageUpdateData: StageUpdateRequest = { newStage: 'Technical Interview' };

      await expect(updateCandidateStage(1, stageUpdateData))
        .rejects.toThrow('NO_ACTIVE_APPLICATION');
    });

    it('debe manejar y re-lanzar errores de base de datos', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.candidate.findUnique.mockRejectedValue(dbError);

      // Spy en console.error para evitar logs durante tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const stageUpdateData: StageUpdateRequest = { newStage: 'Technical Interview' };

      await expect(updateCandidateStage(1, stageUpdateData))
        .rejects.toThrow('Error al actualizar la etapa del candidato');

      consoleSpy.mockRestore();
    });
  });

  describe('Casos edge y límites', () => {
    it('debe manejar candidatos con múltiples aplicaciones (seleccionar la más reciente)', async () => {
      const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };
      const mockApplication = {
        id: 2, // ID más alto (más reciente)
        position: { id: 1, title: 'Software Engineer', interviewFlowId: 1 },
        interviewStep: { id: 1, name: 'Initial Screening', orderIndex: 1 }
      };
      const mockNewInterviewStep = { id: 2, name: 'Technical Interview', orderIndex: 2 };
      const mockUpdatedApplication = { id: 2, position: { title: 'Software Engineer' } };

      mockPrisma.candidate.findUnique.mockResolvedValue(mockCandidate);
      mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
      mockPrisma.interviewStep.findFirst.mockResolvedValue(mockNewInterviewStep);
      mockPrisma.application.update.mockResolvedValue(mockUpdatedApplication);

      const stageUpdateData: StageUpdateRequest = { newStage: 'Technical Interview' };
      const result = await updateCandidateStage(1, stageUpdateData);

      expect(result?.applicationId).toBe(2);
      expect(mockPrisma.application.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 2 }
        })
      );
    });

    it('debe manejar nombres de etapa con caracteres especiales', async () => {
      const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };
      const mockApplication = {
        id: 1,
        position: { id: 1, title: 'Software Engineer', interviewFlowId: 1 },
        interviewStep: { id: 1, name: 'Initial Screening', orderIndex: 1 }
      };
      const mockNewInterviewStep = { id: 3, name: 'CEO Final Interview', orderIndex: 3 };
      const mockUpdatedApplication = { id: 1, position: { title: 'Software Engineer' } };

      mockPrisma.candidate.findUnique.mockResolvedValue(mockCandidate);
      mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
      mockPrisma.interviewStep.findFirst.mockResolvedValue(mockNewInterviewStep);
      mockPrisma.application.update.mockResolvedValue(mockUpdatedApplication);

      const stageUpdateData: StageUpdateRequest = { newStage: 'CEO Final Interview' };
      const result = await updateCandidateStage(1, stageUpdateData);

      expect(result?.currentStage.name).toBe('CEO Final Interview');
    });

    it('debe preservar notas existentes cuando no se proporcionan nuevas notas', async () => {
      const mockCandidate = { id: 1, firstName: 'John', lastName: 'Doe' };
      const mockApplication = {
        id: 1,
        notes: 'Existing notes from previous stage',
        position: { id: 1, title: 'Software Engineer', interviewFlowId: 1 },
        interviewStep: { id: 1, name: 'Initial Screening', orderIndex: 1 }
      };
      const mockNewInterviewStep = { id: 2, name: 'Technical Interview', orderIndex: 2 };
      const mockUpdatedApplication = { id: 1, position: { title: 'Software Engineer' } };

      mockPrisma.candidate.findUnique.mockResolvedValue(mockCandidate);
      mockPrisma.application.findFirst.mockResolvedValue(mockApplication);
      mockPrisma.interviewStep.findFirst.mockResolvedValue(mockNewInterviewStep);
      mockPrisma.application.update.mockResolvedValue(mockUpdatedApplication);

      const stageUpdateData: StageUpdateRequest = { newStage: 'Technical Interview' };
      await updateCandidateStage(1, stageUpdateData);

      expect(mockPrisma.application.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            notes: 'Existing notes from previous stage'
          })
        })
      );
    });
  });
});
