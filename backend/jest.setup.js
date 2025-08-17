// Jest setup file for test configuration

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.REDIS_PASSWORD = '';

// Increase timeout for async operations
jest.setTimeout(30000);

// Suppress console logs during tests (optional)
// console.log = jest.fn();
// console.error = jest.fn();

// Global test cleanup
afterAll(async () => {
  // Clean up any remaining handles
  await new Promise(resolve => setTimeout(resolve, 100));
});
