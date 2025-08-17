// Mock Redis Cache Service for testing
export const mockRedisCacheService = {
  set: jest.fn().mockResolvedValue(undefined),
  get: jest.fn().mockResolvedValue(null),
  delete: jest.fn().mockResolvedValue(undefined),
  exists: jest.fn().mockResolvedValue(false),
  mset: jest.fn().mockResolvedValue(undefined),
  mget: jest.fn().mockResolvedValue([]),
  mdelete: jest.fn().mockResolvedValue(undefined),
  invalidatePattern: jest.fn().mockResolvedValue(undefined),
  warmCache: jest.fn().mockResolvedValue(undefined),
  getStats: jest.fn().mockResolvedValue({
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    hitRate: 0,
    memoryUsage: 0,
    connectedClients: 0
  }),
  healthCheck: jest.fn().mockResolvedValue(true),
  flush: jest.fn().mockResolvedValue(undefined),
  keys: jest.fn().mockResolvedValue([]),
  size: jest.fn().mockResolvedValue(0),
  close: jest.fn().mockResolvedValue(undefined),
  resetStats: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  emit: jest.fn()
};

// Mock the entire redisCacheService module
jest.mock('../../services/redisCacheService', () => ({
  redisCacheService: mockRedisCacheService
}));
