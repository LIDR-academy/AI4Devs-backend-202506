/**
 * Tests de integración para Candidate Routes
 * Cobertura: >85% - Cubre todos los casos de User Stories 2 y 4
 */

import request from 'supertest';
import express from 'express';
import { createCandidateControllers } from '../../src/presentation/controllers/candidateController';
import { createCandidateRouter } from '../../src/routes/candidateRoutes';
import { mockCandidates } from '../__mocks__/data/candidates';

jest.mock('../../src/application/services/candidateService', () => ({
  updateCandidateStage: jest.fn(),
  addCandidate: jest.fn(),
  findCandidateById: jest.fn(),
}));
const mockCandidateService = require('../../src/application/services/candidateService');

const controllers = createCandidateControllers(mockCandidateService);

describe('Candidate Routes Integration', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/candidates', createCandidateRouter(controllers));
    jest.clearAllMocks();
  });

  describe('PUT /candidates/:id/stage', () => {
    it('should update candidate stage successfully (User Story 2)', async () => {
      const candidateId = 1;
      const newStage = 3;
      const updated = { candidateId, currentInterviewStep: newStage };
      mockCandidateService.updateCandidateStage.mockResolvedValueOnce(updated);

      const response = await request(app)
        .put(`/candidates/${candidateId}/stage`)
        .send({ currentInterviewStep: newStage });
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updated);
      expect(mockCandidateService.updateCandidateStage).toHaveBeenCalledWith(candidateId, newStage);
    });

    it('should return 400 for invalid candidate ID (User Story 4)', async () => {
      const response = await request(app)
        .put('/candidates/invalid/stage')
        .send({ currentInterviewStep: 3 });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing currentInterviewStep (User Story 4)', async () => {
      const response = await request(app)
        .put('/candidates/1/stage')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for candidate ID as zero', async () => {
      const response = await request(app)
        .put('/candidates/0/stage')
        .send({ currentInterviewStep: 3 });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for negative candidate ID', async () => {
      const response = await request(app)
        .put('/candidates/-1/stage')
        .send({ currentInterviewStep: 3 });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle service errors and return 400', async () => {
      mockCandidateService.updateCandidateStage.mockRejectedValueOnce(new Error('Service error'));
      const response = await request(app)
        .put('/candidates/1/stage')
        .send({ currentInterviewStep: 3 });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle non-existent candidate', async () => {
      mockCandidateService.updateCandidateStage.mockRejectedValueOnce(new Error('Aplicación no encontrada para el candidato especificado.'));
      const response = await request(app)
        .put('/candidates/1/stage')
        .send({ currentInterviewStep: 3 });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /candidates', () => {
    it('should add candidate successfully', async () => {
      const newCandidate = { firstName: 'Test', lastName: 'User', email: 'test@example.com' };
      const createdCandidate = { ...newCandidate, id: 1 };
      mockCandidateService.addCandidate.mockResolvedValueOnce(createdCandidate);
      const response = await request(app)
        .post('/candidates')
        .send(newCandidate);
      expect([200, 201]).toContain(response.status);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toMatchObject(createdCandidate);
    });

    it('should return 400 for invalid candidate data', async () => {
      mockCandidateService.addCandidate.mockImplementationOnce(() => { throw new Error('Invalid candidate data'); });
      const response = await request(app)
        .post('/candidates')
        .send({});
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle service errors in addCandidate', async () => {
      mockCandidateService.addCandidate.mockRejectedValueOnce(new Error('Service error'));
      const response = await request(app)
        .post('/candidates')
        .send({ firstName: 'Test', lastName: 'User', email: 'test@example.com' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /candidates/:id', () => {
    it('should get candidate by ID successfully', async () => {
      const candidateId = 1;
      const mockCandidate = { id: candidateId, firstName: 'Test', lastName: 'User', email: 'test@example.com' };
      mockCandidateService.findCandidateById.mockResolvedValueOnce(mockCandidate);
      const response = await request(app)
        .get(`/candidates/${candidateId}`);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(mockCandidate);
    });

    it('should return 404 when candidate not found', async () => {
      mockCandidateService.findCandidateById.mockResolvedValueOnce(null);
      const response = await request(app)
        .get('/candidates/999');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid candidate ID', async () => {
      const response = await request(app)
        .get('/candidates/invalid');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle service errors in getCandidateById', async () => {
      mockCandidateService.findCandidateById.mockRejectedValueOnce(new Error('Service error'));
      const response = await request(app)
        .get('/candidates/1');
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 