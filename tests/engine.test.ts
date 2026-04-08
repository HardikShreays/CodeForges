/**
 * @file tests/engine.test.ts
 * @description Unit tests for ExecutionEngine (core orchestrator)
 */

import { ExecutionEngine } from '../src/execution-engine/core';
import { LanguageExecutorFactory } from '../src/execution-engine/factory';
import { TestCase } from '../src/execution-engine/types';

// ─────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition: boolean, description: string): void {
  if (condition) {
    console.log(`  ✅ ${description}`);
    passed++;
  } else {
    console.error(`  ❌ ${description}`);
    failed++;
  }
}

// ─────────────────────────────────────────────────────────
//  Tests
// ─────────────────────────────────────────────────────────

console.log('\n╔══════════════════════════════════════════════╗');
console.log('║       ENGINE TESTS — ExecutionEngine          ║');
console.log('╚══════════════════════════════════════════════╝\n');

const engine = new ExecutionEngine();

// ── Test cases ───────────────────────────────────────────

const testCases: TestCase[] = [
  { id: 'TC-001', input: '10', expectedOutput: '10' },
  { id: 'TC-002', input: '42', expectedOutput: '42' },
  { id: 'TC-003', input: 'hello', expectedOutput: 'hello' },
];

// 1 — Python: all pass
console.log('▸ Python — all test cases pass');
const pyResult = engine.run('print(input)', 'python', testCases);
assert(pyResult.status === 'ACCEPTED', `Status is ACCEPTED (got ${pyResult.status})`);
assert(pyResult.passed === 3, `3 passed (got ${pyResult.passed})`);
assert(pyResult.failed === 0, `0 failed (got ${pyResult.failed})`);
assert(pyResult.totalTests === 3, 'totalTests is 3');
assert(pyResult.runtime > 0, 'Total runtime is positive');
assert(pyResult.errors.length === 0, 'No errors');

// 2 — Python: wrong answer
console.log('\n▸ Python — wrong answer');
const pyWrong = engine.run('print("wrong")', 'python', testCases);
assert(pyWrong.status === 'WRONG_ANSWER', `Status is WRONG_ANSWER (got ${pyWrong.status})`);
assert(pyWrong.passed === 0, `0 passed (got ${pyWrong.passed})`);
assert(pyWrong.failed === 3, `3 failed (got ${pyWrong.failed})`);

// 3 — Java: compilation error
console.log('\n▸ Java — compilation error');
const javaBad = engine.run('int x = 5;', 'java', testCases);
assert(javaBad.status === 'COMPILATION_ERROR', `Status is COMPILATION_ERROR (got ${javaBad.status})`);
assert(javaBad.errors.length > 0, 'Errors array is not empty');

// 4 — C++: successful execution
console.log('\n▸ C++ — successful execution');
const cppCode = `
#include <iostream>
using namespace std;
int main() {
  string s;
  cin >> s;
  cout << s << endl;
  return 0;
}`;
const cppResult = engine.run(cppCode, 'cpp', testCases);
assert(cppResult.status === 'ACCEPTED', `Status is ACCEPTED (got ${cppResult.status})`);
assert(cppResult.passed === 3, `3 passed (got ${cppResult.passed})`);
assert(cppResult.memoryUsed > 0, 'Memory is tracked');

// 5 — Unsupported language
console.log('\n▸ Unsupported language');
const unsupported = engine.run('fn main() {}', 'rust', testCases);
assert(unsupported.status === 'COMPILATION_ERROR', 'Returns error status for unsupported lang');
assert(unsupported.errors[0]!.includes('Unsupported language'), 'Error mentions unsupported language');

// 6 — Empty code
console.log('\n▸ Edge case — empty code');
const emptyCode = engine.run('', 'python', testCases);
assert(emptyCode.status === 'COMPILATION_ERROR', 'Empty code returns error status');
assert(emptyCode.errors[0]!.includes('Empty code'), 'Error mentions empty code');

// 7 — Empty test cases
console.log('\n▸ Edge case — no test cases');
const noTests = engine.run('print("hi")', 'python', []);
assert(noTests.status === 'COMPILATION_ERROR', 'No test cases returns error status');
assert(noTests.errors[0]!.includes('No test cases'), 'Error mentions no test cases');

// 8 — Dependency Injection: custom factory
console.log('\n▸ Dependency Injection — custom factory');
const customFactory = new LanguageExecutorFactory();
const customEngine = new ExecutionEngine(customFactory);
const diResult = customEngine.run('print(input)', 'python', [testCases[0]!]);
assert(diResult.status === 'ACCEPTED', 'Injected factory works correctly');

// 9 — isLanguageSupported
console.log('\n▸ Utility methods');
assert(engine.isLanguageSupported('python'), 'python is supported');
assert(engine.isLanguageSupported('java'), 'java is supported');
assert(!engine.isLanguageSupported('haskell'), 'haskell is not supported');
const supported = engine.getSupportedLanguages();
assert(supported.length >= 3, 'At least 3 languages supported');

// 10 — Runtime error propagation
console.log('\n▸ Runtime error propagation');
const pyError = engine.run('x = 1/0', 'python', [testCases[0]!]);
assert(pyError.status === 'RUNTIME_ERROR', `Status is RUNTIME_ERROR (got ${pyError.status})`);
assert(pyError.errors.length > 0, 'Error captured in errors array');

// ─────────────────────────────────────────────────────────
console.log(`\n─── Engine Tests: ${passed} passed, ${failed} failed ───\n`);
if (failed > 0) process.exit(1);
