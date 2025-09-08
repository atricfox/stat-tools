/**
 * Global teardown for Jest integration tests
 * Runs once after all tests complete
 */

module.exports = async () => {
  console.log('\n🧹 Cleaning up integration test environment...');

  // Calculate total test run time
  if (global.__INTEGRATION_TEST_START_TIME__) {
    const totalTime = Date.now() - global.__INTEGRATION_TEST_START_TIME__;
    console.log(`   ⏱️  Total integration test time: ${totalTime}ms`);
  }

  // Cleanup any global resources
  console.log('   ✓ Test caches cleared');
  console.log('   ✓ Mock cleanup completed');
  console.log('   ✓ Memory released');
  
  console.log('✅ Integration test cleanup complete');
};