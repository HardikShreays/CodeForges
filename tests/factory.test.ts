/**
 * @file tests/factory.test.ts
 * @description Unit tests for LanguageExecutorFactory
 */

import { LanguageExecutorFactory } from '../src/execution-engine/factory';
import { PythonExecutor } from '../src/execution-engine/executors/PythonExecutor';
import { JavaExecutor } from '../src/execution-engine/executors/JavaExecutor';
import { CPPExecutor } from '../src/execution-engine/executors/CPPExecutor';
import { BaseExecutor } from '../src/execution-engine/templates';
import { RunResult } from '../src/execution-engine/types';

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
console.log('║    FACTORY TESTS — LanguageExecutorFactory   ║');
console.log('╚══════════════════════════════════════════════╝\n');

const factory = new LanguageExecutorFactory();

// 1 — Built-in languages
console.log('▸ Built-in language registration');
assert(factory.isSupported('python'), 'python is supported');
assert(factory.isSupported('java'), 'java is supported');
assert(factory.isSupported('cpp'), 'cpp is supported');
assert(factory.isSupported('c++'), 'c++ alias is supported');

// 2 — Correct executor type returned
console.log('\n▸ Correct executor type returned');
assert(factory.getExecutor('python') instanceof PythonExecutor, 'getExecutor("python") → PythonExecutor');
assert(factory.getExecutor('java') instanceof JavaExecutor, 'getExecutor("java") → JavaExecutor');
assert(factory.getExecutor('cpp') instanceof CPPExecutor, 'getExecutor("cpp") → CPPExecutor');

// 3 — Case insensitivity
console.log('\n▸ Case insensitivity');
assert(factory.getExecutor('Python') instanceof PythonExecutor, 'getExecutor("Python") → PythonExecutor');
assert(factory.getExecutor('JAVA') instanceof JavaExecutor, 'getExecutor("JAVA") → JavaExecutor');
assert(factory.getExecutor('CPP') instanceof CPPExecutor, 'getExecutor("CPP") → CPPExecutor');

// 4 — Unsupported language throws
console.log('\n▸ Unsupported language handling');
let threw = false;
try {
  factory.getExecutor('rust');
} catch (e: unknown) {
  threw = true;
  const msg = e instanceof Error ? e.message : '';
  assert(msg.includes('Unsupported language'), 'Error message includes "Unsupported language"');
  assert(msg.includes('rust'), 'Error message includes the language name');
}
assert(threw, 'getExecutor("rust") throws an error');

// 5 — OCP: register new language dynamically
console.log('\n▸ Open/Closed Principle — dynamic registration');

class GoExecutor extends BaseExecutor {
  public readonly language = 'go';
  protected run(_compiledCode: string, input: string): RunResult {
    return { output: input.trim(), runtime: 5, memoryUsed: 4 };
  }
}

factory.registerExecutor('go', () => new GoExecutor());
assert(factory.isSupported('go'), 'go is now supported');
assert(factory.getExecutor('go') instanceof GoExecutor, 'getExecutor("go") → GoExecutor');

// 6 — Each call returns a fresh instance
console.log('\n▸ Fresh instance per call');
const ex1 = factory.getExecutor('python');
const ex2 = factory.getExecutor('python');
assert(ex1 !== ex2, 'Two calls return different instances');

// 7 — getSupportedLanguages
console.log('\n▸ getSupportedLanguages');
const langs = factory.getSupportedLanguages();
assert(langs.includes('python'), 'Lists python');
assert(langs.includes('java'), 'Lists java');
assert(langs.includes('cpp'), 'Lists cpp');
assert(langs.includes('go'), 'Lists go (dynamically added)');

// ─────────────────────────────────────────────────────────
console.log(`\n─── Factory Tests: ${passed} passed, ${failed} failed ───\n`);
if (failed > 0) process.exit(1);
