// Mock Monitoring Service for testing
export const mockMonitoringService = {
  recordPerformanceMetrics: jest.fn(),
  recordSecurityEvent: jest.fn(),
  recordBusinessMetrics: jest.fn(),
  getPerformanceAnalytics: jest.fn().mockResolvedValue({
    averageResponseTime: 100,
    totalRequests: 1000,
    errorRate: 0.01,
    throughput: 100
  }),
  getSecurityAnalytics: jest.fn().mockResolvedValue({
    totalEvents: 50,
    highSeverityEvents: 5,
    authenticationEvents: 20,
    authorizationEvents: 10
  }),
  getBusinessAnalytics: jest.fn().mockResolvedValue({
    totalCandidates: 100,
    totalApplications: 150,
    conversionRate: 0.75,
    averageTimeToHire: 14
  }),
  getHealthStatus: jest.fn().mockResolvedValue({
    status: 'healthy',
    uptime: 3600,
    memoryUsage: 50,
    cpuUsage: 25
  }),
  exportLogs: jest.fn().mockResolvedValue({
    performance: [],
    security: [],
    business: []
  }),
  performanceMiddleware: jest.fn().mockImplementation((req: any, res: any, next: any) => next()),
  startPeriodicCleanup: jest.fn(),
  setupLogger: jest.fn()
};

// Mock the entire monitoringService module
jest.mock('../../services/monitoringService', () => ({
  monitoringService: mockMonitoringService
}));
