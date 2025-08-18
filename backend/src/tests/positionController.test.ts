import { Request, Response } from 'express';
import { getCandidatesByPosition } from '../presentation/controllers/positionController';
import * as positionService from '../application/services/positionService';

// Mock del servicio
jest.mock('../application/services/positionService');
const mockPositionService = positionService as jest.Mocked<typeof positionService>;

describe('Position Controller - getCandidatesByPosition', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    req = {
      params: {}
    };
    
    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });
    
    res = {
      status: statusSpy as any,
      json: jsonSpy as any
    };

    jest.clearAllMocks();
  });

  describe('Validación de parámetros', () => {
    it('debe retornar 400 para ID no numérico', async () => {
      req.params = { id: 'abc' };

      await getCandidatesByPosition(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_POSITION_ID',
          message: 'El ID de la posición debe ser un número entero válido',
          details: 'El parámetro \'id\' recibido no es un número entero válido'
        }
      });
    });

    it('debe retornar 400 para ID negativo', async () => {
      req.params = { id: '-1' };

      await getCandidatesByPosition(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INVALID_POSITION_ID'
        })
      }));
    });

    it('debe retornar 400 para ID cero', async () => {
      req.params = { id: '0' };

      await getCandidatesByPosition(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
    });
  });

  describe('Casos de éxito', () => {
    it('debe retornar 200 con datos de candidatos cuando la posición existe', async () => {
      req.params = { id: '1' };
      
      const mockResult = {
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
          }
        ]
      };

      mockPositionService.getCandidatesByPositionId.mockResolvedValue(mockResult);

      await getCandidatesByPosition(req as Request, res as Response);

      expect(mockPositionService.getCandidatesByPositionId).toHaveBeenCalledWith(1);
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
    });

    it('debe retornar 200 con array vacío cuando la posición no tiene candidatos', async () => {
      req.params = { id: '1' };
      
      const mockResult = {
        positionId: 1,
        positionTitle: 'Software Engineer',
        totalCandidates: 0,
        candidates: []
      };

      mockPositionService.getCandidatesByPositionId.mockResolvedValue(mockResult);

      await getCandidatesByPosition(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
    });
  });

  describe('Casos de error', () => {
    it('debe retornar 404 cuando la posición no existe', async () => {
      req.params = { id: '999' };
      
      mockPositionService.getCandidatesByPositionId.mockResolvedValue(null);

      await getCandidatesByPosition(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'POSITION_NOT_FOUND',
          message: 'La posición especificada no existe',
          details: 'No se encontró ninguna posición con el ID proporcionado'
        }
      });
    });

    it('debe retornar 500 cuando el servicio lanza una excepción', async () => {
      req.params = { id: '1' };
      
      mockPositionService.getCandidatesByPositionId.mockRejectedValue(new Error('Database error'));

      // Spy en console.error para evitar logs durante tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await getCandidatesByPosition(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error interno del servidor',
          details: 'Ha ocurrido un error inesperado en el servidor'
        }
      });

      consoleSpy.mockRestore();
    });
  });
});
