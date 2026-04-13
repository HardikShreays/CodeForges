/**
 * @file tests/problem-management.test.ts
 * @description Unit tests for Problem Management module
 *
 * Tests ProblemService CRUD operations and Evaluator strategies
 * (ExactMatch, Tolerance, strategy swapping at runtime).
 */

import { ProblemService } from '../src/problem-management/services/ProblemService';
import { Evaluator } from '../src/problem-management/services/Evaluator';
import { ExactMatchStrategy } from '../src/problem-management/strategies/ExactMatchStrategy';
import { ToleranceStrategy } from '../src/problem-management/strategies/ToleranceStrategy';

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

function assertThrows(fn: () => void, expectedMsg: string, description: string): void {
  let threw = false;
  try {
    fn();
  } catch (e: unknown) {
    threw = true;
    const msg = e instanceof Error ? e.message : '';
    assert(msg.includes(expectedMsg), `${description} — error contains "${expectedMsg}"`);
  }
  assert(threw, `${description} — throws an error`);
}

// ─────────────────────────────────────────────────────────
//  ProblemService Tests
// ─────────────────────────────────────────────────────────

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║        PROBLEM MANAGEMENT TESTS                         ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

console.log('▸ ProblemService — Create');
{
  const svc = new ProblemService();
  const p = svc.createProblem('P001', 'Two Sum', 'Find two numbers', 'EASY');
  assert(p.id === 'P001', 'createProblem returns correct id');
  assert(p.title === 'Two Sum', 'createProblem returns correct title');
  assert(p.difficulty === 'EASY', 'createProblem returns correct difficulty');
}

console.log('\n▸ ProblemService — Duplicate prevention');
{
  const svc = new ProblemService();
  svc.createProblem('P001', 'Two Sum', 'Find two numbers', 'EASY');
  assertThrows(
    () => svc.createProblem('P001', 'Three Sum', 'Find three', 'MEDIUM'),
    'P001 already exists',
    'Duplicate ID rejected',
  );
}

console.log('\n▸ ProblemService — Get');
{
  const svc = new ProblemService();
  svc.createProblem('P002', 'Max Subarray', 'Find max', 'MEDIUM');
  const p = svc.getProblem('P002');
  assert(p.id === 'P002', 'getProblem returns correct problem');
}

console.log('\n▸ ProblemService — Get non-existent');
{
  const svc = new ProblemService();
  assertThrows(
    () => svc.getProblem('P999'),
    'P999 not found',
    'Non-existent problem throws',
  );
}

console.log('\n▸ ProblemService — List');
{
  const svc = new ProblemService();
  svc.createProblem('P001', 'A', 'desc', 'EASY');
  svc.createProblem('P002', 'B', 'desc', 'MEDIUM');
  const all = svc.listProblems();
  assert(all.length === 2, 'listProblems returns 2 problems');
}

console.log('\n▸ ProblemService — Update');
{
  const svc = new ProblemService();
  svc.createProblem('P001', 'Old Title', 'desc', 'EASY');
  const updated = svc.updateProblem('P001', { title: 'New Title', difficulty: 'HARD' });
  assert(updated.title === 'New Title', 'Title updated correctly');
  assert(updated.difficulty === 'HARD', 'Difficulty updated correctly');
}

console.log('\n▸ ProblemService — Add test case');
{
  const svc = new ProblemService();
  svc.createProblem('P001', 'Echo', 'Echo input', 'EASY');
  svc.addTestCase('P001', '5', '5');
  svc.addTestCase('P001', 'hello', 'hello');
  const p = svc.getProblem('P001');
  assert(p.testCases.length === 2, 'Problem has 2 test cases');
}

// ─────────────────────────────────────────────────────────
//  Evaluator Strategy Tests
// ─────────────────────────────────────────────────────────

console.log('\n▸ ExactMatchStrategy');
{
  const strategy = new ExactMatchStrategy();
  const evaluator = new Evaluator(strategy);
  assert(evaluator.evaluateAnswer('10', '10') === true, '"10" matches "10"');
  assert(evaluator.evaluateAnswer(' 10 ', '10 ') === true, 'Trims whitespace before comparison');
  assert(evaluator.evaluateAnswer('10', '11') === false, '"10" does not match "11"');
}

console.log('\n▸ ToleranceStrategy');
{
  const strategy = new ToleranceStrategy(0.1);
  const evaluator = new Evaluator(strategy);
  assert(evaluator.evaluateAnswer('1.0', '1.05') === true, '1.0 vs 1.05 within tolerance 0.1');
  assert(evaluator.evaluateAnswer('1.0', '1.2') === false, '1.0 vs 1.2 outside tolerance 0.1');
}

console.log('\n▸ Strategy swapping at runtime');
{
  const exactMatch = new ExactMatchStrategy();
  const evaluator = new Evaluator(exactMatch);

  assert(evaluator.evaluateAnswer('1.5', '1.51') === false, 'ExactMatch rejects "1.5" vs "1.51"');

  const tolerance = new ToleranceStrategy(0.05);
  evaluator.setStrategy(tolerance);

  assert(evaluator.evaluateAnswer('1.5', '1.51') === true, 'After swap to Tolerance(0.05), "1.5" vs "1.51" passes');
}

// ─────────────────────────────────────────────────────────
console.log(`\n─── Problem Management Tests: ${passed} passed, ${failed} failed ───\n`);
if (failed > 0) process.exit(1);
