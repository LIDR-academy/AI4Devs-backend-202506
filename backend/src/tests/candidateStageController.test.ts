import { Request, Response } from 'express';
import { updateCandidateStage } from '../presentation/controllers/candidateController';
import * as candidateService from '../application/services/candidateService';

// Mock del servicio
jest.mock('../application/services/candidateService');
const mockCandidateService = candidateService as jest.Mocked<typeof candidateService>;

describe('Candidate Controller - updateCandidateStage', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonSpy: jest.Mock;
  let statusSpy: jest.Mock;

  beforeEach(() => {
    req = {
      params: {},
      body: {}
    };
    
    jsonSpy = jest.fn();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });
    
    res = {
      status: statusSpy as any,
      json: jsonSpy as any
    };

    jest.clearAllMocks();
  });

  describe('Validación de parámetros de entrada', () => {
    it('debe retornar 400 para ID no numérico', async () => {
      req.params = { id: 'abc' };
      req.body = { newStage: 'Technical Interview' };

      await updateCandidateStage(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_CANDIDATE_ID',
          message: 'El ID del candidato debe ser un número entero válido',
          details: 'El parámetro \'id\' recibido no es un número entero válido'
        }
      });
    });

    it('debe retornar 400 para ID negativo', async () => {
      req.params = { id: '-1' };
      req.body = { newStage: 'Technical Interview' };

      await updateCandidateStage(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INVALID_CANDIDATE_ID'
        })
      }));
    });

    it('debe retornar 400 para ID cero', async () => {
      req.params = { id: '0' };
      req.body = { newStage: 'Technical Interview' };

      await updateCandidateStage(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
    });

    it('debe retornar 400 cuando falta newStage en el body', async () => {
      req.params = { id: '1' };
      req.body = {};

      await updateCandidateStage(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_REQUEST_BODY',
          message: 'El campo \'newStage\' es requerido',
          details: 'El cuerpo de la petición debe contener un campo \'newStage\' válido'
        }
      });
    });

    it('debe retornar 400 cuando el body está vacío', async () => {
      req.params = { id: '1' };
      req.body = null;

      await updateCandidateStage(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.objectContaining({
          code: 'INVALID_REQUEST_BODY'
        })
      }));
    });

    it('debe retornar 400 cuando las notas exceden 500 caracteres', async () => {
      req.params = { id: '1' };
      req.body = {
        newStage: 'Technical Interview',
        notes: 'a'.repeat(501) // 501 caracteres
      };

      await updateCandidateStage(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_NOTES_LENGTH',
          message: 'Las notas no pueden exceder 500 caracteres',
          details: 'El campo \'notes\' debe tener máximo 500 caracteres'
        }
      });
    });
  });

  describe('Casos de éxito', () => {
    it('debe retornar 200 con datos actualizados cuando la actualización es exitosa', async () => {
      req.params = { id: '1' };
      req.body = { newStage: 'Technical Interview', notes: 'Test notes' };
      
      const mockResult = {
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
        updatedAt: '2024-08-18T10:30:00.000Z',
        notes: 'Test notes'
      };

      mockCandidateService.updateCandidateStage.mockResolvedValue(mockResult);

      await updateCandidateStage(req as Request, res as Response);

      expect(mockCandidateService.updateCandidateStage).toHaveBeenCalledWith(1, {
        newStage: 'Technical Interview',
        notes: 'Test notes'
      });
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        data: mockResult
      });
    });

    it('debe funcionar sin notas en el body', async () => {
      req.params = { id: '2' };
      req.body = { newStage: 'Manager Interview' };
      
      const mockResult = {
        candidateId: 2,
        applicationId: 2,
        candidateName: 'Jane Smith',
        positionTitle: 'Data Scientist',
        previousStage: {
          id: 2,
          name: 'Technical Interview',
          orderIndex: 2
        },
        currentStage: {
          id: 3,
          name: 'Manager Interview',
          orderIndex: 3
        },
        updatedAt: '2024-08-18T10:35:00.000Z'
      };

      mockCandidateService.updateCandidateStage.mockResolvedValue(mockResult);

      await updateCandidateStage(req as Request, res as Response);

      expect(mockCandidateService.updateCandidateStage).toHaveBeenCalledWith(2, {
        newStage: 'Manager Interview'
      });
      expect(statusSpy).toHaveBeenCalledWith(200);
    });
  });

  describe('Casos de error de negocio', () => {
    it('debe retornar 404 cuando el candidato no existe', async () => {
      req.params = { id: '999' };
      req.body = { newStage: 'Technical Interview' };
      
      mockCandidateService.updateCandidateStage.mockResolvedValue(null);

      await updateCandidateStage(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'CANDIDATE_NOT_FOUND',
          message: 'El candidato especificado no existe',
          details: 'No se encontró ningún candidato con el ID proporcionado'
        }
      });
    });

    it('debe retornar 400 cuando el candidato no tiene aplicaciones activas', async () => {
      req.params = { id: '1' };
      req.body = { newStage: 'Technical Interview' };
      
      const error = new Error('NO_ACTIVE_APPLICATION');
      mockCandidateService.updateCandidateStage.mockRejectedValue(error);

      await updateCandidateStage(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NO_ACTIVE_APPLICATION',
          message: 'El candidato no tiene aplicaciones activas',
          details: 'No se encontró ninguna aplicación para actualizar la etapa'
        }
      });
    });

    it('debe retornar 400 cuando la etapa es inválida', async () => {
      req.params = { id: '1' };
      req.body = { newStage: 'Invalid Stage' };
      
      const error = new Error('INVALID_STAGE');
      mockCandidateService.updateCandidateStage.mockRejectedValue(error);

      await updateCandidateStage(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_STAGE',
          message: 'La etapa especificada no es válida para este candidato',
          details: 'La etapa no existe en el flujo de entrevistas de la posición aplicada'
        }
      });
    });
  });

  describe('Manejo de errores internos', () => {
    it('debe retornar 500 cuando el servicio lanza un error inesperado', async () => {
      req.params = { id: '1' };
      req.body = { newStage: 'Technical Interview' };
      
      const error = new Error('Database connection failed');
      mockCandidateService.updateCandidateStage.mockRejectedValue(error);

      // Spy en console.error para evitar logs durante tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await updateCandidateStage(req as Request, res as Response);

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

  describe('Casos edge', () => {
    it('debe manejar notas exactamente de 500 caracteres', async () => {
      req.params = { id: '1' };
      req.body = {
        newStage: 'Technical Interview',
        notes: 'a'.repeat(500) // Exactamente 500 caracteres
      };

      const mockResult = {
        candidateId: 1,
        applicationId: 1,
        candidateName: 'John Doe',
        positionTitle: 'Software Engineer',
        previousStage: { id: 1, name: 'Initial Screening', orderIndex: 1 },
        currentStage: { id: 2, name: 'Technical Interview', orderIndex: 2 },
        updatedAt: '2024-08-18T10:30:00.000Z',
        notes: 'a'.repeat(500)
      };

      mockCandidateService.updateCandidateStage.mockResolvedValue(mockResult);

      await updateCandidateStage(req as Request, res as Response);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(mockCandidateService.updateCandidateStage).toHaveBeenCalled();
    });

    it('debe manejar newStage con espacios en blanco', async () => {
      req.params = { id: '1' };
      req.body = { newStage: '  Technical Interview  ' };

      const mockResult = {
        candidateId: 1,
        applicationId: 1,
        candidateName: 'John Doe',
        positionTitle: 'Software Engineer',
        previousStage: { id: 1, name: 'Initial Screening', orderIndex: 1 },
        currentStage: { id: 2, name: 'Technical Interview', orderIndex: 2 },
        updatedAt: '2024-08-18T10:30:00.000Z'
      };

      mockCandidateService.updateCandidateStage.mockResolvedValue(mockResult);

      await updateCandidateStage(req as Request, res as Response);

      expect(mockCandidateService.updateCandidateStage).toHaveBeenCalledWith(1, {
        newStage: '  Technical Interview  ' // Se pasa tal como viene
      });
      expect(statusSpy).toHaveBeenCalledWith(200);
    });
  });
});
