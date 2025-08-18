import request from 'supertest';
import { app } from '../../index';

describe('Integration Tests - GET /positions/:id/candidates', () => {
  describe('Casos exitosos', () => {
    it('debe retornar candidatos para posición existente', async () => {
      const response = await request(app)
        .get('/positions/1/candidates')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          positionId: 1,
          positionTitle: expect.any(String),
          totalCandidates: expect.any(Number),
          candidates: expect.arrayContaining([
            expect.objectContaining({
              candidateId: expect.any(Number),
              fullName: expect.any(String),
              email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
              currentInterviewStep: expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
                orderIndex: expect.any(Number)
              }),
              averageScore: expect.any(Object), // Puede ser number o null
              totalInterviews: expect.any(Number),
              applicationDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)
            })
          ])
        })
      });
    });

    it('debe ordenar candidatos por fecha de aplicación descendente', async () => {
      const response = await request(app)
        .get('/positions/1/candidates')
        .expect(200);

      const candidates = response.body.data.candidates;
      
      if (candidates.length > 1) {
        for (let i = 0; i < candidates.length - 1; i++) {
          const currentDate = new Date(candidates[i].applicationDate);
          const nextDate = new Date(candidates[i + 1].applicationDate);
          expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
        }
      }
    });

    it('debe calcular averageScore correctamente', async () => {
      const response = await request(app)
        .get('/positions/1/candidates')
        .expect(200);

      const candidatesWithScores = response.body.data.candidates.filter(
        (c: any) => c.averageScore !== null
      );

      candidatesWithScores.forEach((candidate: any) => {
        expect(candidate.averageScore).toBeGreaterThanOrEqual(0);
        expect(candidate.averageScore).toBeLessThanOrEqual(5);
        expect(candidate.totalInterviews).toBeGreaterThan(0);
      });
    });
  });

  describe('Casos de error', () => {
    it('debe retornar 400 para ID inválido', async () => {
      const response = await request(app)
        .get('/positions/abc/candidates')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'INVALID_POSITION_ID',
          message: 'El ID de la posición debe ser un número entero válido',
          details: 'El parámetro \'id\' recibido no es un número entero válido'
        }
      });
    });

    it('debe retornar 400 para ID negativo', async () => {
      const response = await request(app)
        .get('/positions/-1/candidates')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: expect.objectContaining({
          code: 'INVALID_POSITION_ID'
        })
      });
    });

    it('debe retornar 404 para posición inexistente', async () => {
      const response = await request(app)
        .get('/positions/999999/candidates')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'POSITION_NOT_FOUND',
          message: 'La posición especificada no existe',
          details: 'No se encontró ninguna posición con el ID proporcionado'
        }
      });
    });
  });

  describe('Formato de respuesta', () => {
    it('debe tener la estructura de respuesta correcta', async () => {
      const response = await request(app)
        .get('/positions/1/candidates')
        .expect(200);

      // Verificar estructura base
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');

      // Verificar estructura de data
      const data = response.body.data;
      expect(data).toHaveProperty('positionId');
      expect(data).toHaveProperty('positionTitle');
      expect(data).toHaveProperty('totalCandidates');
      expect(data).toHaveProperty('candidates');

      // Verificar que candidates es un array
      expect(Array.isArray(data.candidates)).toBe(true);

      // Si hay candidatos, verificar estructura
      if (data.candidates.length > 0) {
        const candidate = data.candidates[0];
        expect(candidate).toHaveProperty('candidateId');
        expect(candidate).toHaveProperty('fullName');
        expect(candidate).toHaveProperty('email');
        expect(candidate).toHaveProperty('currentInterviewStep');
        expect(candidate).toHaveProperty('averageScore');
        expect(candidate).toHaveProperty('totalInterviews');
        expect(candidate).toHaveProperty('applicationDate');

        // Verificar estructura de currentInterviewStep
        expect(candidate.currentInterviewStep).toHaveProperty('id');
        expect(candidate.currentInterviewStep).toHaveProperty('name');
        expect(candidate.currentInterviewStep).toHaveProperty('orderIndex');
      }
    });

    it('debe tener tipos de datos correctos', async () => {
      const response = await request(app)
        .get('/positions/1/candidates')
        .expect(200);

      const data = response.body.data;
      
      expect(typeof data.positionId).toBe('number');
      expect(typeof data.positionTitle).toBe('string');
      expect(typeof data.totalCandidates).toBe('number');
      expect(Array.isArray(data.candidates)).toBe(true);

      if (data.candidates.length > 0) {
        const candidate = data.candidates[0];
        expect(typeof candidate.candidateId).toBe('number');
        expect(typeof candidate.fullName).toBe('string');
        expect(typeof candidate.email).toBe('string');
        expect(typeof candidate.currentInterviewStep.id).toBe('number');
        expect(typeof candidate.currentInterviewStep.name).toBe('string');
        expect(typeof candidate.currentInterviewStep.orderIndex).toBe('number');
        expect(typeof candidate.totalInterviews).toBe('number');
        expect(typeof candidate.applicationDate).toBe('string');
        
        // averageScore puede ser number o null
        expect(
          candidate.averageScore === null || typeof candidate.averageScore === 'number'
        ).toBe(true);
      }
    });
  });

  describe('Performance y escalabilidad', () => {
    it('debe responder en menos de 1 segundo', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/positions/1/candidates')
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(1000);
    });
  });
});

// Helper personalizado para Jest
expect.extend({
  toBeOneOf(received, expected) {
    const pass = expected.some((option: any) => {
      if (option === null) return received === null;
      if (typeof option === 'function') return option(received);
      return received === option;
    });
    
    return {
      message: () => `expected ${received} to be one of ${expected}`,
      pass,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(expected: any[]): R;
    }
  }
}
