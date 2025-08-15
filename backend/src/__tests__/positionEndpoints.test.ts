import request from 'supertest';
import { app } from '../index';

describe('Position Endpoints', () => {
    describe('GET /positions/:id/candidates', () => {
        it('should return 400 for invalid position ID format', async () => {
            const response = await request(app)
                .get('/positions/invalid/candidates')
                .expect(400);
            
            expect(response.body.error).toBe('Invalid position ID format');
        });

        it('should return 200 for valid position ID', async () => {
            const response = await request(app)
                .get('/positions/1/candidates')
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(typeof response.body.count).toBe('number');
        });
    });

    describe('GET /positions/interview-steps', () => {
        it('should return 200 and interview steps data', async () => {
            const response = await request(app)
                .get('/positions/interview-steps')
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(typeof response.body.count).toBe('number');
        });
    });

    describe('PUT /candidates/:id/stage', () => {
        it('should return 400 for invalid candidate ID format', async () => {
            const response = await request(app)
                .put('/candidates/invalid/stage')
                .send({ stageId: 1 })
                .expect(400);
            
            expect(response.body.error).toBe('Invalid candidate ID format');
        });

        it('should return 400 for missing stageId', async () => {
            const response = await request(app)
                .put('/candidates/1/stage')
                .send({})
                .expect(400);
            
            expect(response.body.error).toBe('Invalid stage ID format');
        });

        it('should return 400 for invalid stageId format', async () => {
            const response = await request(app)
                .put('/candidates/1/stage')
                .send({ stageId: 'invalid' })
                .expect(400);
            
            expect(response.body.error).toBe('Invalid stage ID format');
        });
    });
});
