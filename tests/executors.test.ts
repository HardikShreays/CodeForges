/**
 * @file tests/executors.test.ts
 * @description Unit tests for PythonExecutor, JavaExecutor, CPPExecutor
 */

import { PythonExecutor } from '../src/execution-engine/executors/PythonExecutor';
import { JavaExecutor } from '../src/execution-engine/executors/JavaExecutor';
import { CPPExecutor } from '../src/execution-engine/executors/CPPExecutor';
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

const testCase: TestCase = {
  id: 'TC-001',
  input: '42',
  expectedOutput: '42',
};

// ═════════════════════════════════════════════════════════
//  PYTHON EXECUTOR
// ═════════════════════════════════════════════════════════

console.log('\n╔══════════════════════════════════════════════╗');
console.log('║         EXECUTOR TESTS — Language Suite       ║');
console.log('╚══════════════════════════════════════════════╝\n');

console.log('━━ PythonExecutor ━━');

const pyExec = new PythonExecutor();

// 1 — Language property
assert(pyExec.language === 'python', 'language is "python"');

// 2 — Successful execution
const pyCode = 'print(input)';
const pyResult = pyExec.execute(pyCode, testCase);
assert(pyResult.passed === true, 'print(input) with input "42" → passes');
assert(pyResult.actualOutput === '42', 'Output is "42"');
assert(pyResult.runtime >= 0, 'Runtime is non-negative');
assert(pyResult.memoryUsed > 0, 'Memory usage is positive');
assert(pyResult.error === undefined, 'No error reported');

// 3 — Wrong answer
const pyWrongResult = pyExec.execute('print("hello")', testCase);
assert(pyWrongResult.passed === false, 'Wrong output → fails');
assert(pyWrongResult.actualOutput === 'hello', 'Actual output captured');

// 4 — Runtime error (division by zero)
const pyErrorResult = pyExec.execute('x = 1/0', testCase);
assert(pyErrorResult.passed === false, 'Division by zero → fails');
assert(pyErrorResult.error !== undefined, 'Error message present');
assert(pyErrorResult.error!.includes('ZeroDivisionError'), 'Error mentions ZeroDivisionError');

// 5 — Exception simulation
const pyExcResult = pyExec.execute('raise Exception("test")', testCase);
assert(pyExcResult.passed === false, 'raise Exception → fails');
assert(pyExcResult.error !== undefined && pyExcResult.error.includes('runtime exception'), 'Error mentions runtime exception');

// ═════════════════════════════════════════════════════════
//  JAVA EXECUTOR
// ═════════════════════════════════════════════════════════

console.log('\n━━ JavaExecutor ━━');

const javaExec = new JavaExecutor();

// 1 — Language property
assert(javaExec.language === 'java', 'language is "java"');

// 2 — Successful execution
const javaCode = `
import java.util.Scanner;
public class Main {
  public static void main(String[] args) {
    Scanner scanner = new Scanner(System.in);
    System.out.println(scanner.nextLine());
  }
}`;
const javaResult = javaExec.execute(javaCode, testCase);
assert(javaResult.passed === true, 'Java scanner echo → passes');
assert(javaResult.actualOutput === '42', 'Output is "42"');

// 3 — Compilation error (missing class)
const javaBadCode = 'System.out.println("hello");';
const javaCEResult = javaExec.execute(javaBadCode, testCase);
assert(javaCEResult.passed === false, 'Missing class → fails');
assert(javaCEResult.error !== undefined && javaCEResult.error.includes('Compilation Error'), 'Compilation Error reported');

// 4 — Compilation error (missing main)
const javaNoMain = 'public class Solution { }';
const javaNoMainResult = javaExec.execute(javaNoMain, testCase);
assert(javaNoMainResult.passed === false, 'Missing main method → fails');
assert(javaNoMainResult.error !== undefined && javaNoMainResult.error.includes('Compilation Error'), 'Compilation Error for missing main');

// 5 — NullPointerException simulation
const javaNPE = `
public class Main {
  public static void main(String[] args) {
    String s = null;
  }
}`;
const javaNPEResult = javaExec.execute(javaNPE, testCase);
assert(javaNPEResult.passed === false, 'null; → NullPointerException');
assert(javaNPEResult.error !== undefined && javaNPEResult.error.includes('NullPointerException'), 'NullPointerException reported');

// ═════════════════════════════════════════════════════════
//  CPP EXECUTOR
// ═════════════════════════════════════════════════════════

console.log('\n━━ CPPExecutor ━━');

const cppExec = new CPPExecutor();

// 1 — Language property
assert(cppExec.language === 'cpp', 'language is "cpp"');

// 2 — Successful execution
const cppCode = `
#include <iostream>
using namespace std;
int main() {
  int x;
  cin >> x;
  cout << x << endl;
  return 0;
}`;
const cppResult = cppExec.execute(cppCode, testCase);
assert(cppResult.passed === true, 'C++ cin/cout echo → passes');
assert(cppResult.actualOutput === '42', 'Output is "42"');

// 3 — Compilation error (missing main)
const cppBadCode = '#include <iostream>\ncout << "hello";';
const cppCEResult = cppExec.execute(cppBadCode, testCase);
assert(cppCEResult.passed === false, 'Missing main → fails');
assert(cppCEResult.error !== undefined && cppCEResult.error.includes('Compilation Error'), 'Compilation Error reported');

// 4 — Segfault simulation
const cppSegfault = `
#include <iostream>
int main() {
  int *p = nullptr;
  return 0;
}`;
const cppSegResult = cppExec.execute(cppSegfault, testCase);
assert(cppSegResult.passed === false, 'nullptr → Segmentation fault');
assert(cppSegResult.error !== undefined && cppSegResult.error.includes('Segmentation fault'), 'Segfault reported');

// 5 — Low memory footprint
assert(cppResult.memoryUsed < 15, 'C++ memory < 15 MB (efficient)');

// ─────────────────────────────────────────────────────────
console.log(`\n─── Executor Tests: ${passed} passed, ${failed} failed ───\n`);
if (failed > 0) process.exit(1);
