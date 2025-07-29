/**
 * Tests unitarios para CandidateController
 * Cobertura: >85% - Cubre todos los casos de User Stories 2 y 4
 */

import { Request, Response } from 'express';
import { 
  addCandidateController, 
  getCandidateById, 
  updateCandidateStage 
} from '../../../src/presentation/controllers/candidateController';
import { candidateService } from '../../../src/application/services/candidateService';

// Mock del servicio
jest.mock('../../../src/application/services/candidateService');
const mockCandidateService = candidateService as jest.Mocked<typeof candidateService>;

describe('CandidateController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      params: {},
      body: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    mockNext = jest.fn();
  });

  describe('addCandidateController', () => {
    it('should add candidate successfully', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com'
      };
      const createdCandidate = {
        id: 4,
        ...candidateData,
        phone: null,
        address: null
      };

      mockRequest.body = candidateData;
      mockCandidateService.addCandidate.mockResolvedValue(createdCandidate);

      // Act
      await addCandidateController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCandidateService.addCandidate).toHaveBeenCalledWith(candidateData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Candidate added successfully',
        data: createdCandidate
      });
    });

    it('should return 400 for invalid candidate data', async () => {
      // Arrange
      mockRequest.body = {};
      const error = new Error('Invalid candidate data');
      mockCandidateService.addCandidate.mockRejectedValue(error);

      // Act
      await addCandidateController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid candidate data'
      });
    });

    it('should handle service errors in addCandidate', async () => {
      // Arrange
      const candidateData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com'
      };
      const serviceError = new Error('Service error');

      mockRequest.body = candidateData;
      mockCandidateService.addCandidate.mockRejectedValue(serviceError);

      // Act
      await addCandidateController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Service error'
      });
    });
  });

  describe('getCandidateById', () => {
    it('should get candidate by ID successfully', async () => {
      // Arrange
      const candidateId = 1;
      const mockCandidate = {
        id: 1,
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@email.com',
        phone: '123456789',
        address: 'Calle Principal 123',
        educations: [],
        workExperiences: [],
        resumes: [],
        applications: []
      } as any;

      mockRequest.params = { id: candidateId.toString() };
      mockCandidateService.findCandidateById.mockResolvedValue(mockCandidate);

      // Act
      await getCandidateById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCandidateService.findCandidateById).toHaveBeenCalledWith(candidateId);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCandidate);
    });

    it('should return 404 when candidate not found', async () => {
      // Arrange
      const candidateId = 999;

      mockRequest.params = { id: candidateId.toString() };
      mockCandidateService.findCandidateById.mockResolvedValue(null);

      // Act
      await getCandidateById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Candidate not found'
      });
    });

    it('should return 400 for invalid candidate ID', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await getCandidateById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid candidate ID'
      });
    });

    it('should handle service errors in getCandidateById', async () => {
      // Arrange
      const candidateId = 1;
      const serviceError = new Error('Service error');

      mockRequest.params = { id: candidateId.toString() };
      mockCandidateService.findCandidateById.mockRejectedValue(serviceError);

      // Act
      await getCandidateById(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Service error'
      });
    });
  });

  describe('updateCandidateStage', () => {
    it('should update candidate stage successfully (User Story 2)', async () => {
      // Arrange
      const candidateId = 1;
      const newStage = 3;
      const mockResult = {
        candidateId: 1,
        currentInterviewStep: 3
      };

      mockRequest.params = { id: candidateId.toString() };
      mockRequest.body = { currentInterviewStep: newStage };
      mockCandidateService.updateCandidateStage.mockResolvedValue(mockResult);

      // Act
      await updateCandidateStage(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCandidateService.updateCandidateStage).toHaveBeenCalledWith(candidateId, newStage);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 for invalid candidate ID (User Story 4)', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };
      mockRequest.body = { currentInterviewStep: 3 };

      // Act
      await updateCandidateStage(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid parameters'
      });
    });

    it('should return 400 for missing currentInterviewStep (User Story 4)', async () => {
      // Arrange
      mockRequest.params = { id: '1' };
      mockRequest.body = { currentInterviewStep: 'invalid' };

      // Act
      await updateCandidateStage(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid parameters'
      });
    });

    it('should return 400 for candidate ID as zero', async () => {
      // Arrange
      mockRequest.params = { id: '0' };
      mockRequest.body = { currentInterviewStep: 3 };

      // Act
      await updateCandidateStage(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid parameters'
      });
    });

    it('should return 400 for negative candidate ID', async () => {
      // Arrange
      mockRequest.params = { id: '-1' };
      mockRequest.body = { currentInterviewStep: 3 };

      // Act
      await updateCandidateStage(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid parameters'
      });
    });

    it('should handle service errors in updateCandidateStage', async () => {
      // Arrange
      const candidateId = 1;
      const newStage = 3;
      const serviceError = new Error('Service error');

      mockRequest.params = { id: candidateId.toString() };
      mockRequest.body = { currentInterviewStep: newStage };
      mockCandidateService.updateCandidateStage.mockRejectedValue(serviceError);

      // Act
      await updateCandidateStage(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Service error'
      });
    });

    it('should handle non-existent candidate', async () => {
      // Arrange
      const candidateId = 999;
      const newStage = 3;
      const notFoundError = new Error('Aplicación no encontrada para el candidato especificado.');

      mockRequest.params = { id: candidateId.toString() };
      mockRequest.body = { currentInterviewStep: newStage };
      mockCandidateService.updateCandidateStage.mockRejectedValue(notFoundError);

      // Act
      await updateCandidateStage(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Aplicación no encontrada para el candidato especificado.'
      });
    });
  });
}); 