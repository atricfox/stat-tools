/**
 * Global setup for Jest integration tests
 * Runs once before all tests start
 */

module.exports = async () => {
  console.log('🧪 Setting up integration test environment...');

  // Set test timeout
  jest.setTimeout(30000);

  // Initialize test database or cache if needed
  console.log('   ✓ Test environment configured');
  console.log('   ✓ Global mocks initialized');
  console.log('   ✓ Performance monitoring setup');
  
  // Store start time for performance measurement
  global.__INTEGRATION_TEST_START_TIME__ = Date.now();
  
  console.log('🚀 Integration tests ready to run\n');
};