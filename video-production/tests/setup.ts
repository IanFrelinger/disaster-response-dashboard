// Test setup file for Jest
import { jest } from '@jest/globals';

// Global test configuration
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  
  // Increase timeout for video processing tests
  jest.setTimeout(10000);
});

afterAll(() => {
  // Cleanup any remaining test artifacts
  process.env.NODE_ENV = '';
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
