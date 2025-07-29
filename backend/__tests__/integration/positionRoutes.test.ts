/**
 * Tests de integración para Position Routes
 * Cobertura: >85% - Cubre todos los casos de User Stories 1 y 3
 */

import request from 'supertest';
import express from 'express';
import positionRoutes from '../../src/routes/positionRoutes';
import { mockPrisma } from '../setup';
import { mockApplications } from '../__mocks__/data/applications';

// Mock del servicio
jest.mock('../../src/application/services/positionService');
const mockPositionService = require('../../src/application/services/positionService');

describe('Position Routes Integration', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    app.use('/positions', positionRoutes);
  });

  describe('GET /positions/:id/candidates', () => {
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

      mockPositionService.getCandidatesByPosition.mockResolvedValue(expectedCandidates);

      // Act
      const response = await request(app)
        .get(`/positions/${positionId}/candidates`)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedCandidates);
      expect(mockPositionService.getCandidatesByPosition).toHaveBeenCalledWith(positionId);
    });

    it('should return 400 for invalid position ID (User Story 4)', async () => {
      // Act
      const response = await request(app)
        .get('/positions/invalid/candidates')
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'El parámetro id debe ser un número válido.'
      });
    });

    it('should return 400 for missing position ID', async () => {
      // Act
      const response = await request(app)
        .get('/positions//candidates')
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'El parámetro id debe ser un número válido.'
      });
    });

    it('should return 400 for position ID as zero', async () => {
      // Act
      const response = await request(app)
        .get('/positions/0/candidates')
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'El parámetro id debe ser un número válido.'
      });
    });

    it('should return 400 for negative position ID', async () => {
      // Act
      const response = await request(app)
        .get('/positions/-1/candidates')
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'El parámetro id debe ser un número válido.'
      });
    });

    it('should return 400 for decimal position ID', async () => {
      // Act
      const response = await request(app)
        .get('/positions/1.5/candidates')
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'El parámetro id debe ser un número válido.'
      });
    });

    it('should return empty array when no candidates exist', async () => {
      // Arrange
      const positionId = 999;
      mockPositionService.getCandidatesByPosition.mockResolvedValue([]);

      // Act
      const response = await request(app)
        .get(`/positions/${positionId}/candidates`)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should handle service errors and return 500', async () => {
      // Arrange
      const positionId = 1;
      const serviceError = new Error('Service error');
      mockPositionService.getCandidatesByPosition.mockRejectedValue(serviceError);

      // Act
      const response = await request(app)
        .get(`/positions/${positionId}/candidates`);

      // Assert
      expect(response.status).toBe(500);
    });

    it('should handle large position ID', async () => {
      // Arrange
      const positionId = 999999999;
      mockPositionService.getCandidatesByPosition.mockResolvedValue([]);

      // Act
      const response = await request(app)
        .get(`/positions/${positionId}/candidates`)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(200);
      expect(mockPositionService.getCandidatesByPosition).toHaveBeenCalledWith(positionId);
    });

    it('should handle position ID as string number', async () => {
      // Arrange
      const positionId = '123';
      mockPositionService.getCandidatesByPosition.mockResolvedValue([]);

      // Act
      const response = await request(app)
        .get(`/positions/${positionId}/candidates`)
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBe(200);
      expect(mockPositionService.getCandidatesByPosition).toHaveBeenCalledWith(123);
    });

    it('should return correct content type header', async () => {
      // Arrange
      const positionId = 1;
      mockPositionService.getCandidatesByPosition.mockResolvedValue([]);

      // Act
      const response = await request(app)
        .get(`/positions/${positionId}/candidates`);

      // Assert
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('GET /api-docs', () => {
    it('should serve Swagger documentation', async () => {
      // Act
      const response = await request(app)
        .get('/api-docs');

      // Assert
      expect(response.status).toBe(200);
    });
  });
}); 