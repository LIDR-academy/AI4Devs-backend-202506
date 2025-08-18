import request from 'supertest';
import { app } from '../../index';

// Configurar entorno de test
process.env.NODE_ENV = 'test';

describe('Integration Tests - PUT /candidates/:id/stage', () => {
  describe('Casos exitosos', () => {
    it('debe actualizar la etapa de un candidato exitosamente', async () => {
      const candidateId = 1; // John Doe
      const stageUpdateData = {
        newStage: 'Initial Screening',
        notes: 'Candidate ready for initial screening.'
      };

      const response = await request(app)
        .put(`/candidates/${candidateId}/stage`)
        .send(stageUpdateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          candidateId: candidateId,
          applicationId: expect.any(Number),
          candidateName: expect.any(String),
          positionTitle: expect.any(String),
          previousStage: expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            orderIndex: expect.any(Number)
          }),
          currentStage: expect.objectContaining({
            id: expect.any(Number),
            name: 'Initial Screening',
            orderIndex: expect.any(Number)
          }),
          updatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),
          notes: stageUpdateData.notes
        })
      });
    });

    it('debe actualizar la etapa sin notas', async () => {
      const candidateId = 2; // María García
      const stageUpdateData = {
        newStage: 'Technical Interview'
      };

      const response = await request(app)
        .put(`/candidates/${candidateId}/stage`)
        .send(stageUpdateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.currentStage.name).toBe('Technical Interview');
      expect(response.body.data.candidateId).toBe(candidateId);
    });

    it('debe mantener la consistencia de datos después de la actualización', async () => {
      const candidateId = 1;
      
      // Primero obtener el estado actual
      const initialState = await request(app)
        .get('/positions/1/candidates')
        .expect(200);

      const initialCandidate = initialState.body.data.candidates.find(
        (c: any) => c.candidateId === candidateId
      );

      // Actualizar la etapa
      const stageUpdateData = { newStage: 'Technical Interview' };
      await request(app)
        .put(`/candidates/${candidateId}/stage`)
        .send(stageUpdateData)
        .expect(200);

      // Verificar que el cambio se refleja en la consulta de posiciones
      const updatedState = await request(app)
        .get('/positions/1/candidates')
        .expect(200);

      const updatedCandidate = updatedState.body.data.candidates.find(
        (c: any) => c.candidateId === candidateId
      );

      expect(updatedCandidate.currentInterviewStep.name).toBe('Technical Interview');
      expect(updatedCandidate.candidateId).toBe(initialCandidate.candidateId);
      expect(updatedCandidate.fullName).toBe(initialCandidate.fullName);
    });
  });

  describe('Casos de error - Validación de entrada', () => {
    it('debe retornar 400 para ID de candidato inválido', async () => {
      const response = await request(app)
        .put('/candidates/abc/stage')
        .send({ newStage: 'Technical Interview' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'INVALID_CANDIDATE_ID',
          message: 'El ID del candidato debe ser un número entero válido',
          details: 'El parámetro \'id\' recibido no es un número entero válido'
        }
      });
    });

    it('debe retornar 400 para ID negativo', async () => {
      const response = await request(app)
        .put('/candidates/-1/stage')
        .send({ newStage: 'Technical Interview' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CANDIDATE_ID');
    });

    it('debe retornar 400 cuando falta newStage en el body', async () => {
      const response = await request(app)
        .put('/candidates/1/stage')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'INVALID_REQUEST_BODY',
          message: 'El campo \'newStage\' es requerido',
          details: 'El cuerpo de la petición debe contener un campo \'newStage\' válido'
        }
      });
    });

    it('debe retornar 400 cuando las notas exceden 500 caracteres', async () => {
      const longNotes = 'a'.repeat(501);
      
      const response = await request(app)
        .put('/candidates/1/stage')
        .send({
          newStage: 'Technical Interview',
          notes: longNotes
        })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'INVALID_NOTES_LENGTH',
          message: 'Las notas no pueden exceder 500 caracteres',
          details: 'El campo \'notes\' debe tener máximo 500 caracteres'
        }
      });
    });
  });

  describe('Casos de error - Entidades no encontradas', () => {
    it('debe retornar 404 para candidato inexistente', async () => {
      const response = await request(app)
        .put('/candidates/999999/stage')
        .send({ newStage: 'Technical Interview' })
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'CANDIDATE_NOT_FOUND',
          message: 'El candidato especificado no existe',
          details: 'No se encontró ningún candidato con el ID proporcionado'
        }
      });
    });

    it('debe retornar 400 para etapa inválida', async () => {
      const response = await request(app)
        .put('/candidates/1/stage')
        .send({ newStage: 'Non-Existent Stage' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'INVALID_STAGE',
          message: 'La etapa especificada no es válida para este candidato',
          details: 'La etapa no existe en el flujo de entrevistas de la posición aplicada'
        }
      });
    });
  });

  describe('Formato de respuesta y consistencia', () => {
    it('debe tener la estructura de respuesta correcta para casos exitosos', async () => {
      const response = await request(app)
        .put('/candidates/1/stage')
        .send({ newStage: 'Technical Interview', notes: 'Test notes' })
        .expect(200);

      // Verificar estructura base
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');

      // Verificar estructura de data
      const data = response.body.data;
      expect(data).toHaveProperty('candidateId');
      expect(data).toHaveProperty('applicationId');
      expect(data).toHaveProperty('candidateName');
      expect(data).toHaveProperty('positionTitle');
      expect(data).toHaveProperty('previousStage');
      expect(data).toHaveProperty('currentStage');
      expect(data).toHaveProperty('updatedAt');
      expect(data).toHaveProperty('notes');

      // Verificar estructura de previousStage
      expect(data.previousStage).toHaveProperty('id');
      expect(data.previousStage).toHaveProperty('name');
      expect(data.previousStage).toHaveProperty('orderIndex');

      // Verificar estructura de currentStage
      expect(data.currentStage).toHaveProperty('id');
      expect(data.currentStage).toHaveProperty('name');
      expect(data.currentStage).toHaveProperty('orderIndex');
    });

    it('debe tener tipos de datos correctos en la respuesta', async () => {
      const response = await request(app)
        .put('/candidates/1/stage')
        .send({ newStage: 'Technical Interview' })
        .expect(200);

      const data = response.body.data;
      
      expect(typeof data.candidateId).toBe('number');
      expect(typeof data.applicationId).toBe('number');
      expect(typeof data.candidateName).toBe('string');
      expect(typeof data.positionTitle).toBe('string');
      expect(typeof data.updatedAt).toBe('string');
      
      expect(typeof data.previousStage.id).toBe('number');
      expect(typeof data.previousStage.name).toBe('string');
      expect(typeof data.previousStage.orderIndex).toBe('number');
      
      expect(typeof data.currentStage.id).toBe('number');
      expect(typeof data.currentStage.name).toBe('string');
      expect(typeof data.currentStage.orderIndex).toBe('number');
    });

    it('debe tener formato de fecha ISO correcto en updatedAt', async () => {
      const response = await request(app)
        .put('/candidates/1/stage')
        .send({ newStage: 'Initial Screening' })
        .expect(200);

      const updatedAt = response.body.data.updatedAt;
      expect(updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      
      // Verificar que es una fecha válida
      const date = new Date(updatedAt);
      expect(date.getTime()).not.toBeNaN();
      
      // Verificar que es una fecha reciente (dentro de los últimos 10 segundos)
      const now = new Date();
      const timeDiff = now.getTime() - date.getTime();
      expect(timeDiff).toBeLessThan(10000); // 10 segundos
    });
  });

  describe('Casos edge y límites', () => {
    it('debe manejar notas exactamente de 500 caracteres', async () => {
      const maxLengthNotes = 'a'.repeat(500);
      
      const response = await request(app)
        .put('/candidates/1/stage')
        .send({
          newStage: 'Technical Interview',
          notes: maxLengthNotes
        })
        .expect(200);

      expect(response.body.data.notes).toBe(maxLengthNotes);
    });

    it('debe manejar nombres de etapa con espacios y caracteres especiales', async () => {
      // Este test asume que existe una etapa con este nombre en los datos de prueba
      const response = await request(app)
        .put('/candidates/1/stage')
        .send({ newStage: 'Initial Screening' })
        .expect(200);

      expect(response.body.data.currentStage.name).toBe('Initial Screening');
    });

    it('debe manejar actualizaciones consecutivas del mismo candidato', async () => {
      const candidateId = 1;
      
      // Primera actualización
      const firstUpdate = await request(app)
        .put(`/candidates/${candidateId}/stage`)
        .send({ newStage: 'Initial Screening', notes: 'First update' })
        .expect(200);

      // Segunda actualización
      const secondUpdate = await request(app)
        .put(`/candidates/${candidateId}/stage`)
        .send({ newStage: 'Technical Interview', notes: 'Second update' })
        .expect(200);

      expect(secondUpdate.body.data.previousStage.name).toBe('Initial Screening');
      expect(secondUpdate.body.data.currentStage.name).toBe('Technical Interview');
      expect(secondUpdate.body.data.notes).toBe('Second update');
    });
  });

  describe('Performance y escalabilidad', () => {
    it('debe responder en menos de 1 segundo', async () => {
      const startTime = Date.now();
      
      await request(app)
        .put('/candidates/1/stage')
        .send({ newStage: 'Technical Interview' })
        .expect(200);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(1000);
    });

    it('debe manejar múltiples actualizaciones concurrentes', async () => {
      // Crear múltiples peticiones concurrentes para diferentes candidatos
      const promises = [
        request(app)
          .put('/candidates/1/stage')
          .send({ newStage: 'Technical Interview', notes: 'Concurrent test 1' }),
        request(app)
          .put('/candidates/2/stage')
          .send({ newStage: 'Technical Interview', notes: 'Concurrent test 2' })
      ];

      const responses = await Promise.all(promises);
      
      // Todas las respuestas deben ser exitosas
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      // Los datos deben ser diferentes para cada candidato
      expect(responses[0].body.data.candidateId).not.toBe(responses[1].body.data.candidateId);
    });
  });

  describe('Integridad de datos', () => {
    it('debe mantener la integridad referencial después de la actualización', async () => {
      const candidateId = 1;
      
      // Realizar actualización
      const updateResponse = await request(app)
        .put(`/candidates/${candidateId}/stage`)
        .send({ newStage: 'Technical Interview' })
        .expect(200);

      const { applicationId, currentStage } = updateResponse.body.data;

      // Verificar que el candidato individual refleja el cambio
      const candidateResponse = await request(app)
        .get(`/candidates/${candidateId}`)
        .expect(200);

      // Verificar que la aplicación fue actualizada correctamente
      const candidateData = candidateResponse.body;
      const application = candidateData.applications?.find((app: any) => app.id === applicationId);
      
      if (application) {
        expect(application.currentInterviewStep).toBe(currentStage.id);
      }
    });
  });
});
