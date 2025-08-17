import request from 'supertest';
import { testApp } from './testApp';

// Import mocks
import './mocks/eventBusMock';
import './mocks/redisCacheMock';
import './mocks/monitoringServiceMock';
import './mocks/apiGatewayMock';

describe('Security Tests', () => {
  describe('Authentication & Authorization', () => {
    test('should reject requests without authentication', async () => {
      const response = await request(testApp)
        .get('/positions/1/candidates')
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access token required');
    });

    test('should reject invalid JWT tokens', async () => {
      const response = await request(testApp)
        .get('/positions/1/candidates')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid or expired token');
    });
  });

  describe('Input Validation', () => {
    test('should validate position ID parameter', async () => {
      const response = await request(testApp)
        .get('/positions/invalid-id/candidates')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'id',
          message: 'Position ID must be a positive integer'
        })
      );
    });

    test('should validate candidate stage update data', async () => {
      const response = await request(testApp)
        .put('/candidates/1/stage')
        .send({
          positionId: 'invalid',
          currentInterviewStep: 'invalid'
        })
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveLength(2);
    });

    test('should prevent SQL injection attempts', async () => {
      const response = await request(testApp)
        .get('/positions/1; DROP TABLE candidates; --/candidates')
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });

    test('should prevent XSS attempts', async () => {
      const response = await request(testApp)
        .put('/candidates/1/stage')
        .send({
          positionId: 1,
          currentInterviewStep: 2,
          notes: '<script>alert("xss")</script>'
        })
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limiting', async () => {
      const requests = Array(101).fill(null).map(() => 
        request(testApp).get('/positions/1/candidates')
      );
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
      expect(rateLimited[0].body.message).toContain('Too many requests');
    });
  });

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(testApp)
        .get('/')
        .expect(200);
      
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    test('should include HSTS header in production', async () => {
      process.env.NODE_ENV = 'production';
      const response = await request(testApp)
        .get('/')
        .expect(200);
      
      expect(response.headers).toHaveProperty('strict-transport-security');
      process.env.NODE_ENV = 'test';
    });
  });

  describe('CORS Configuration', () => {
    test('should reject requests from unauthorized origins', async () => {
      const response = await request(testApp)
        .get('/positions/1/candidates')
        .set('Origin', 'http://malicious-site.com')
        .expect(401); // Should be rejected by authentication middleware
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('Request Size Limits', () => {
    test('should reject oversized requests', async () => {
      const largeData = 'x'.repeat(11 * 1024 * 1024); // 11MB
      
      const response = await request(testApp)
        .post('/candidates')
        .set('Content-Type', 'application/json')
        .set('Content-Length', (11 * 1024 * 1024).toString())
        .send({ data: largeData })
        .expect(413);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Request entity too large');
    });
  });

  describe('File Upload Security', () => {
    test('should reject unauthorized file types', async () => {
      const response = await request(testApp)
        .post('/upload')
        .attach('file', Buffer.from('fake executable'), 'malware.exe')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Only PDF and DOCX files are allowed');
    });

    test('should reject oversized files', async () => {
      const largeFile = Buffer.alloc(6 * 1024 * 1024); // 6MB
      
      const response = await request(testApp)
        .post('/upload')
        .attach('file', largeFile, 'large.pdf')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('File size must not exceed 5MB');
    });
  });

  describe('Error Handling', () => {
    test('should not expose sensitive information in errors', async () => {
      const response = await request(testApp)
        .get('/nonexistent-endpoint')
        .expect(404);
      
      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).not.toHaveProperty('sql');
      expect(response.body).not.toHaveProperty('query');
    });

    test('should handle database errors gracefully', async () => {
      // This test would require mocking database failures
      // Implementation depends on specific error scenarios
    });
  });
});
