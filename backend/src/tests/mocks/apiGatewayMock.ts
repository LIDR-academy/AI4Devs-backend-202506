// Mock API Gateway for testing
export const mockApiGateway = {
  gatewayMiddleware: jest.fn().mockImplementation((req: any, res: any, next: any) => next()),
  healthCheck: jest.fn().mockResolvedValue({
    status: 'healthy',
    services: {
      candidates: true,
      pipeline: true,
      analytics: true
    }
  }),
  getStats: jest.fn().mockResolvedValue({
    routes: ['/api/v1/candidates', '/api/v1/pipeline'],
    services: ['candidates', 'pipeline', 'analytics'],
    timestamp: new Date()
  }),
  on: jest.fn(),
  emit: jest.fn()
};

// Mock the entire apiGateway module
jest.mock('../../gateway/apiGateway', () => ({
  apiGateway: mockApiGateway
}));
