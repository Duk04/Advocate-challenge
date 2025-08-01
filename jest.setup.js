// Mock mongoose for tests
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  model: jest.fn(),
  Schema: jest.fn(),
  Types: {
    ObjectId: {
      isValid: jest.fn()
    }
  }
}));

// Mock environment variables
process.env.MONGODB_URL = 'mongodb://localhost:27017/test';

// Global test setup
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}; 