/**
 * @module Core
 * @description ExecutionEngine — the public-facing orchestrator.
 *
 * This is the single entry-point for the execution engine module.
 * It accepts a code submission, selects the correct executor
 * through the factory, runs every test case, and returns an
 * aggregated ExecutionResult.
 *
 * SOLID principles applied:
 *  - SRP: Only orchestrates; does NOT know how to execute code.
 *  - OCP: Adding a language does NOT touch this class.
 *  - DIP: Depends on ExecutorInterface (abstraction), not concrete classes.
 *         The factory is injected via constructor (IoC).
 */

import {
  TestCase,
  TestCaseResult,
  ExecutionResult,
  ExecutionStatus,
} from '../types';
import { LanguageExecutorFactory } from '../factory';

export class ExecutionEngine {
  /**
   * The factory is injected — makes testing and extension trivial.
   */
  private readonly factory: LanguageExecutorFactory;

  constructor(factory?: LanguageExecutorFactory) {
    this.factory = factory ?? new LanguageExecutorFactory();
  }

  /**
   * Execute submitted code against a set of test cases.
   *
   * @param code       Source code submitted by the user
   * @param language   Programming language identifier
   * @param testCases  Array of test cases to run
   * @returns          Aggregated ExecutionResult
   */
  public run(
    code: string,
    language: string,
    testCases: TestCase[],
  ): ExecutionResult {
    // ── Validate inputs ──────────────────────────────
    if (!code || code.trim().length === 0) {
      return this.buildErrorResult(testCases, 'Empty code submission');
    }

    if (!testCases || testCases.length === 0) {
      return this.buildErrorResult([], 'No test cases provided');
    }

    // ── Resolve executor ─────────────────────────────
    let executor;
    try {
      executor = this.factory.getExecutor(language);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return this.buildErrorResult(testCases, message);
    }

    // ── Execute each test case ───────────────────────
    const results: TestCaseResult[] = [];
    const errors: string[] = [];

    for (const testCase of testCases) {
      const result = executor.execute(code, testCase);
      results.push(result);

      if (result.error) {
        errors.push(`[${result.testCaseId}] ${result.error}`);
      }
    }

    // ── Aggregate metrics ────────────────────────────
    const passed = results.filter((r) => r.passed).length;
    const failed = results.length - passed;
    const totalRuntime = results.reduce((sum, r) => sum + r.runtime, 0);
    const peakMemory = Math.max(...results.map((r) => r.memoryUsed), 0);

    // ── Determine overall status ─────────────────────
    const status = this.determineStatus(results, errors);

    return {
      status,
      passed,
      failed,
      totalTests: testCases.length,
      runtime: Math.round(totalRuntime * 100) / 100,
      memoryUsed: Math.round(peakMemory * 100) / 100,
      results,
      errors,
    };
  }

  /**
   * Check if a language is supported without throwing.
   */
  public isLanguageSupported(language: string): boolean {
    return this.factory.isSupported(language);
  }

  /**
   * List all supported languages.
   */
  public getSupportedLanguages(): string[] {
    return this.factory.getSupportedLanguages();
  }

  // ─────────────────────────────────────────────────────
  //  Private helpers
  // ─────────────────────────────────────────────────────

  private determineStatus(
    results: TestCaseResult[],
    errors: string[],
  ): ExecutionStatus {
    // Compilation errors are fatal
    if (errors.some((e) => e.includes('Compilation Error'))) {
      return 'COMPILATION_ERROR';
    }

    // Time / Memory limits
    if (errors.some((e) => e.includes('Time Limit Exceeded'))) {
      return 'TIME_LIMIT_EXCEEDED';
    }
    if (errors.some((e) => e.includes('Memory Limit Exceeded'))) {
      return 'MEMORY_LIMIT_EXCEEDED';
    }

    // Runtime errors
    if (errors.some((e) => e.includes('Runtime Error') || e.includes('Segmentation fault'))) {
      return 'RUNTIME_ERROR';
    }

    // All passed?
    if (results.every((r) => r.passed)) {
      return 'ACCEPTED';
    }

    return 'WRONG_ANSWER';
  }

  private buildErrorResult(
    testCases: TestCase[],
    errorMessage: string,
  ): ExecutionResult {
    return {
      status: 'COMPILATION_ERROR',
      passed: 0,
      failed: testCases.length,
      totalTests: testCases.length,
      runtime: 0,
      memoryUsed: 0,
      results: [],
      errors: [errorMessage],
    };
  }
}
