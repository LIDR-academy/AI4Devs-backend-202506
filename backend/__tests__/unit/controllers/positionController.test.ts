/**
 * Tests unitarios para PositionController
 * Cobertura: >85% - Cubre todos los casos de User Stories 1 y 3
 */

import { Request, Response } from 'express';
import { getCandidatesByPosition } from '../../../src/presentation/controllers/positionController';
import { positionService } from '../../../src/application/services/positionService';

// Mock del servicio
jest.mock('../../../src/application/services/positionService');
const mockPositionService = positionService as jest.Mocked<typeof positionService>;

describe('PositionController', () => {
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

  describe('getCandidatesByPosition', () => {
    it('should return candidates for a position successfully (User Story 1)', async () => {
      // Arrange
      const positionId = 1;
      const expectedCandidates = [
        {
          candidateId: 1,
          fullName: 'Juan Pérez',
          currentInterviewStep: 'Entrevista Técnica',
          averageScore: 7.5
        },
        {
          candidateId: 2,
          fullName: 'Ana Gómez',
          currentInterviewStep: 'HR',
          averageScore: null
        }
      ];

      mockRequest.params = { id: positionId.toString() };
      mockPositionService.getCandidatesByPosition.mockResolvedValue(expectedCandidates);

      // Act
      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockPositionService.getCandidatesByPosition).toHaveBeenCalledWith(positionId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedCandidates);
    });

    it('should return 400 for invalid position ID (User Story 4)', async () => {
      // Arrange
      mockRequest.params = { id: 'invalid' };

      // Act
      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'El parámetro id debe ser un número válido.'
      });
      expect(mockPositionService.getCandidatesByPosition).not.toHaveBeenCalled();
    });

    it('should return 400 for missing position ID', async () => {
      // Arrange
      mockRequest.params = { id: undefined as any };

      // Act
      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'El parámetro id debe ser un número válido.'
      });
    });

    it('should return 400 for position ID as zero', async () => {
      // Arrange
      mockRequest.params = { id: '0' };

      // Act
      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'El parámetro id debe ser un número válido.'
      });
    });

    it('should return 400 for negative position ID', async () => {
      // Arrange
      mockRequest.params = { id: '-1' };

      // Act
      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'El parámetro id debe ser un número válido.'
      });
    });

    it('should return 400 for decimal position ID', async () => {
      // Arrange
      mockRequest.params = { id: '1.5' };

      // Act
      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'El parámetro id debe ser un número válido.'
      });
    });

    it('should return empty array when no candidates exist', async () => {
      // Arrange
      const positionId = 999;
      mockRequest.params = { id: positionId.toString() };
      mockPositionService.getCandidatesByPosition.mockResolvedValue([]);

      // Act
      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockPositionService.getCandidatesByPosition).toHaveBeenCalledWith(positionId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith([]);
    });

    it('should handle service errors and return 500', async () => {
      // Arrange
      const positionId = 1;
      const serviceError = new Error('Service error');
      mockRequest.params = { id: positionId.toString() };
      mockPositionService.getCandidatesByPosition.mockRejectedValue(serviceError);

      // Act
      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });

    it('should handle large position ID', async () => {
      // Arrange
      const positionId = 999999999;
      mockRequest.params = { id: positionId.toString() };
      mockPositionService.getCandidatesByPosition.mockResolvedValue([]);

      // Act
      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockPositionService.getCandidatesByPosition).toHaveBeenCalledWith(positionId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should handle position ID as string number', async () => {
      // Arrange
      const positionId = '123';
      mockRequest.params = { id: positionId };
      mockPositionService.getCandidatesByPosition.mockResolvedValue([]);

      // Act
      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockPositionService.getCandidatesByPosition).toHaveBeenCalledWith(123);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should handle candidates with null average scores', async () => {
      // Arrange
      const positionId = 1;
      const candidatesWithNullScores = [
        {
          candidateId: 1,
          fullName: 'Juan Pérez',
          currentInterviewStep: 'Entrevista Técnica',
          averageScore: null
        }
      ];

      mockRequest.params = { id: positionId.toString() };
      mockPositionService.getCandidatesByPosition.mockResolvedValue(candidatesWithNullScores);

      // Act
      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(candidatesWithNullScores);
    });

    it('should handle candidates with zero average scores', async () => {
      // Arrange
      const positionId = 1;
      const candidatesWithZeroScores = [
        {
          candidateId: 1,
          fullName: 'Juan Pérez',
          currentInterviewStep: 'Entrevista Técnica',
          averageScore: 0
        }
      ];

      mockRequest.params = { id: positionId.toString() };
      mockPositionService.getCandidatesByPosition.mockResolvedValue(candidatesWithZeroScores);

      // Act
      await getCandidatesByPosition(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(candidatesWithZeroScores);
    });
  });
}); 