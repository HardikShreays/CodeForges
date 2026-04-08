/**
 * @file tests/run-all.ts
 * @description Master test runner — executes all test suites sequentially.
 */

async function runTests(): Promise<void> {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║           CodeForges — Execution Engine Tests            ║');
  console.log('║           Author: Syed Darain Qamar                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    console.log('▶ Running Factory Tests...');
    await import('./factory.test');

    console.log('\n▶ Running Executor Tests...');
    await import('./executors.test');

    console.log('\n▶ Running Engine Tests...');
    await import('./engine.test');

    console.log('\n══════════════════════════════════════════════════════════');
    console.log('  ✅  ALL TEST SUITES PASSED');
    console.log('══════════════════════════════════════════════════════════\n');
  } catch (err) {
    console.error('\n❌ Test suite failed:', err);
    process.exit(1);
  }
}

runTests();
