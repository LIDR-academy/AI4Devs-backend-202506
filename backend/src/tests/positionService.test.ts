import { getCandidatesByPositionId } from '../application/services/positionService';

// Mock de Prisma
const mockPrisma = {
  position: {
    findUnique: jest.fn(),
  },
  application: {
    findMany: jest.fn(),
  },
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

describe('Position Service - getCandidatesByPositionId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Verificación de posición existente', () => {
    it('debe retornar null cuando la posición no existe', async () => {
      mockPrisma.position.findUnique.mockResolvedValue(null);

      const result = await getCandidatesByPositionId(999);

      expect(result).toBeNull();
      expect(mockPrisma.position.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        select: { id: true, title: true }
      });
    });
  });

  describe('Procesamiento de candidatos exitoso', () => {
    it('debe retornar candidatos con puntuación media calculada correctamente', async () => {
      const mockPosition = {
        id: 1,
        title: 'Software Engineer'
      };

      const mockApplications = [
        {
          applicationDate: new Date('2024-08-15'),
          candidate: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@gmail.com'
          },
          interviewStep: {
            id: 2,
            name: 'Technical Interview',
            orderIndex: 2
          },
          interviews: [
            { score: 4 },
            { score: 5 }
          ]
        },
        {
          applicationDate: new Date('2024-08-16'),
          candidate: {
            id: 2,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@gmail.com'
          },
          interviewStep: {
            id: 1,
            name: 'Initial Screening',
            orderIndex: 1
          },
          interviews: []
        }
      ];

      mockPrisma.position.findUnique.mockResolvedValue(mockPosition);
      mockPrisma.application.findMany.mockResolvedValue(mockApplications);

      const result = await getCandidatesByPositionId(1);

      expect(result).toEqual({
        positionId: 1,
        positionTitle: 'Software Engineer',
        totalCandidates: 2,
        candidates: [
          {
            candidateId: 1,
            fullName: 'John Doe',
            email: 'john.doe@gmail.com',
            currentInterviewStep: {
              id: 2,
              name: 'Technical Interview',
              orderIndex: 2
            },
            averageScore: 4.5,
            totalInterviews: 2,
            applicationDate: '2024-08-15T00:00:00.000Z'
          },
          {
            candidateId: 2,
            fullName: 'Jane Smith',
            email: 'jane.smith@gmail.com',
            currentInterviewStep: {
              id: 1,
              name: 'Initial Screening',
              orderIndex: 1
            },
            averageScore: null,
            totalInterviews: 0,
            applicationDate: '2024-08-16T00:00:00.000Z'
          }
        ]
      });
    });

    it('debe manejar entrevistas con scores nulos correctamente', async () => {
      const mockPosition = { id: 1, title: 'Software Engineer' };
      const mockApplications = [
        {
          applicationDate: new Date('2024-08-15'),
          candidate: {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@gmail.com'
          },
          interviewStep: {
            id: 2,
            name: 'Technical Interview',
            orderIndex: 2
          },
          interviews: [
            { score: 4 },
            { score: null },  // Score nulo debe ser ignorado
            { score: 5 }
          ]
        }
      ];

      mockPrisma.position.findUnique.mockResolvedValue(mockPosition);
      mockPrisma.application.findMany.mockResolvedValue(mockApplications);

      const result = await getCandidatesByPositionId(1);

      expect(result?.candidates[0].averageScore).toBe(4.5); // (4 + 5) / 2
      expect(result?.candidates[0].totalInterviews).toBe(3); // Cuenta todas las entrevistas
    });

    it('debe retornar posición sin candidatos cuando no hay aplicaciones', async () => {
      const mockPosition = { id: 1, title: 'Software Engineer' };
      
      mockPrisma.position.findUnique.mockResolvedValue(mockPosition);
      mockPrisma.application.findMany.mockResolvedValue([]);

      const result = await getCandidatesByPositionId(1);

      expect(result).toEqual({
        positionId: 1,
        positionTitle: 'Software Engineer',
        totalCandidates: 0,
        candidates: []
      });
    });
  });

  describe('Cálculo de puntuación media', () => {
    it('debe redondear correctamente a 1 decimal', async () => {
      const mockPosition = { id: 1, title: 'Test Position' };
      const mockApplications = [
        {
          applicationDate: new Date('2024-08-15'),
          candidate: {
            id: 1,
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com'
          },
          interviewStep: {
            id: 1,
            name: 'Interview',
            orderIndex: 1
          },
          interviews: [
            { score: 3 },
            { score: 4 },
            { score: 5 }
          ]
        }
      ];

      mockPrisma.position.findUnique.mockResolvedValue(mockPosition);
      mockPrisma.application.findMany.mockResolvedValue(mockApplications);

      const result = await getCandidatesByPositionId(1);

      expect(result?.candidates[0].averageScore).toBe(4.0); // (3 + 4 + 5) / 3 = 4.0
    });
  });

  describe('Consulta de base de datos', () => {
    it('debe llamar application.findMany con los parámetros correctos', async () => {
      const mockPosition = { id: 1, title: 'Software Engineer' };
      
      mockPrisma.position.findUnique.mockResolvedValue(mockPosition);
      mockPrisma.application.findMany.mockResolvedValue([]);

      await getCandidatesByPositionId(1);

      expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
        where: { positionId: 1 },
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
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
            }
          }
        },
        orderBy: {
          applicationDate: 'desc'
        }
      });
    });
  });

  describe('Manejo de errores', () => {
    it('debe propagar errores de base de datos', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.position.findUnique.mockRejectedValue(dbError);

      // Spy en console.error para evitar logs durante tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(getCandidatesByPositionId(1)).rejects.toThrow('Database connection failed');

      consoleSpy.mockRestore();
    });
  });
});
