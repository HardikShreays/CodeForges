/**
 * @file src/main.ts
 * @description Demo entry point — showcases the Execution Engine in action.
 *
 * Run with:  npx ts-node src/main.ts
 */

import { ExecutionEngine } from './execution-engine';
import { TestCase } from './execution-engine/types';
import { SubmissionService } from './submission-service';

// ─────────────────────────────────────────────────────────

const engine = new ExecutionEngine();
const submissionService = new SubmissionService();

console.log('');
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║         CodeForges — Submission Pipeline Demo            ║');
console.log('║  Submission Service + Job Queue + Execution Engine       ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');

// ── Test Cases ───────────────────────────────────────────

const testCases: TestCase[] = [
  { id: 'TC-001', input: '5',   expectedOutput: '5' },
  { id: 'TC-002', input: '100', expectedOutput: '100' },
  { id: 'TC-003', input: '0',   expectedOutput: '0' },
];

// Register a simple echo problem in the SubmissionService
submissionService.registerProblem('ECHO', testCases);

// ── Direct Engine Demo (backwards compatible) ────────────

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  🐍 Python Submission');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const pythonCode = `
x = input()
print(x)
`.trim();

const pyResult = engine.run(pythonCode, 'python', testCases);
console.log(`  Status:  ${pyResult.status}`);
console.log(`  Passed:  ${pyResult.passed}/${pyResult.totalTests}`);
console.log(`  Runtime: ${pyResult.runtime}ms`);
console.log(`  Memory:  ${pyResult.memoryUsed}MB`);
if (pyResult.errors.length > 0) {
  console.log(`  Errors:  ${pyResult.errors.join(', ')}`);
}

// ── Java Submission ──────────────────────────────────────

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  ☕ Java Submission');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const javaCode = `
import java.util.Scanner;
public class Main {
  public static void main(String[] args) {
    Scanner scanner = new Scanner(System.in);
    System.out.println(scanner.nextLine());
  }
}
`.trim();

const javaResult = engine.run(javaCode, 'java', testCases);
console.log(`  Status:  ${javaResult.status}`);
console.log(`  Passed:  ${javaResult.passed}/${javaResult.totalTests}`);
console.log(`  Runtime: ${javaResult.runtime}ms`);
console.log(`  Memory:  ${javaResult.memoryUsed}MB`);
if (javaResult.errors.length > 0) {
  console.log(`  Errors:  ${javaResult.errors.join(', ')}`);
}

// ── C++ Submission ───────────────────────────────────────

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  ⚡ C++ Submission');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const cppCode = `
#include <iostream>
using namespace std;
int main() {
  string s;
  cin >> s;
  cout << s << endl;
  return 0;
}
`.trim();

const cppResult = engine.run(cppCode, 'cpp', testCases);
console.log(`  Status:  ${cppResult.status}`);
console.log(`  Passed:  ${cppResult.passed}/${cppResult.totalTests}`);
console.log(`  Runtime: ${cppResult.runtime}ms`);
console.log(`  Memory:  ${cppResult.memoryUsed}MB`);
if (cppResult.errors.length > 0) {
  console.log(`  Errors:  ${cppResult.errors.join(', ')}`);
}

// ── Error Demo: Compilation Error ────────────────────────

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  🚫 Java — Compilation Error Demo');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const badJava = 'System.out.println("hello");';
const badResult = engine.run(badJava, 'java', testCases);
console.log(`  Status:  ${badResult.status}`);
console.log(`  Errors:  ${badResult.errors.join('\n           ')}`);

// ── Error Demo: Runtime Error ────────────────────────────

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  💥 Python — Runtime Error Demo');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const errorPy = 'x = 1/0';
const errorResult = engine.run(errorPy, 'python', [testCases[0]!]);
console.log(`  Status:  ${errorResult.status}`);
console.log(`  Errors:  ${errorResult.errors.join('\n           ')}`);

// ── Submission Service + Job Queue Demo ──────────────────

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  📥 Submission Service + Job Queue Demo');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const submissionId = submissionService.submit({
  problemId: 'ECHO',
  language: 'python',
  sourceCode: pythonCode,
});

console.log(`  Created submission: ${submissionId}`);
console.log(`  Initial status:     ${submissionService.getStatus(submissionId)}`);

submissionService.processQueue();

console.log(`  Final status:       ${submissionService.getStatus(submissionId)}`);
console.log('  Result summary:', submissionService.getResult(submissionId));

// ── Supported Languages ──────────────────────────────────

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  📋 Supported Languages: ${engine.getSupportedLanguages().join(', ')}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
