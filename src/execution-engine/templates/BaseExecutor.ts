/**
 * @module Templates
 * @description Template Method Pattern — BaseExecutor
 *
 * Defines a skeleton algorithm for code execution:
 *    compile() → run() → validate()
 *
 * Subclasses (PythonExecutor, JavaExecutor, CPPExecutor) override
 * individual steps WITHOUT changing the overall algorithm structure.
 *
 * SOLID principles applied:
 *  - SRP: Each step has a single responsibility.
 *  - OCP: New languages extend BaseExecutor; no modification required.
 *  - LSP: Any subclass is substitutable for BaseExecutor.
 *  - DIP: Implements ExecutorInterface so consumers depend on abstraction.
 */

import {
  TestCase,
  TestCaseResult,
  CompilationResult,
  RunResult,
  ExecutorInterface,
} from '../types';

export abstract class BaseExecutor implements ExecutorInterface {
  abstract readonly language: string;

  // ─────────────────────────────────────────────────────
  //  Template Method  (final algorithm — do NOT override)
  // ─────────────────────────────────────────────────────

  /**
   * Orchestrates the full execution pipeline for one test case.
   * This is the **template method**: it calls compile → run → validate
   * in a fixed order, catching errors at each stage.
   */
  public execute(code: string, testCase: TestCase): TestCaseResult {
    const startTime = performance.now();

    try {
      // Step 1 — Compile (optional for interpreted languages)
      const compilation = this.compile(code);
      if (!compilation.success) {
        return this.buildResult(testCase, {
          passed: false,
          actualOutput: '',
          runtime: performance.now() - startTime,
          memoryUsed: 0,
          error: `Compilation Error: ${compilation.errors.join('; ')}`,
        });
      }

      // Step 2 — Run against test input
      const runResult = this.run(compilation.compiledCode, testCase.input);

      // Check time limit
      const timeLimit = testCase.timeLimit ?? 5000;
      if (runResult.runtime > timeLimit) {
        return this.buildResult(testCase, {
          passed: false,
          actualOutput: runResult.output,
          runtime: runResult.runtime,
          memoryUsed: runResult.memoryUsed,
          error: `Time Limit Exceeded: ${runResult.runtime.toFixed(2)}ms > ${timeLimit}ms`,
        });
      }

      // Check memory limit
      const memoryLimit = testCase.memoryLimit ?? 256;
      if (runResult.memoryUsed > memoryLimit) {
        return this.buildResult(testCase, {
          passed: false,
          actualOutput: runResult.output,
          runtime: runResult.runtime,
          memoryUsed: runResult.memoryUsed,
          error: `Memory Limit Exceeded: ${runResult.memoryUsed.toFixed(2)}MB > ${memoryLimit}MB`,
        });
      }

      // Check for runtime errors
      if (runResult.error) {
        return this.buildResult(testCase, {
          passed: false,
          actualOutput: runResult.output,
          runtime: runResult.runtime,
          memoryUsed: runResult.memoryUsed,
          error: `Runtime Error: ${runResult.error}`,
        });
      }

      // Step 3 — Validate output
      const passed = this.validate(runResult.output, testCase.expectedOutput);

      return this.buildResult(testCase, {
        passed,
        actualOutput: runResult.output,
        runtime: runResult.runtime,
        memoryUsed: runResult.memoryUsed,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return this.buildResult(testCase, {
        passed: false,
        actualOutput: '',
        runtime: performance.now() - startTime,
        memoryUsed: 0,
        error: `Unexpected Error: ${message}`,
      });
    }
  }

  // ─────────────────────────────────────────────────────
  //  Hook / Abstract Methods  (override in subclasses)
  // ─────────────────────────────────────────────────────

  /**
   * Compile the source code. Interpreted languages return the code as-is.
   * Default implementation assumes no compilation step (hook method).
   */
  protected compile(code: string): CompilationResult {
    return { success: true, compiledCode: code, errors: [] };
  }

  /**
   * Run compiled/interpreted code with the given input.
   * **Must** be implemented by every concrete executor.
   */
  protected abstract run(compiledCode: string, input: string): RunResult;

  /**
   * Compare actual output with expected output.
   * Default implementation trims whitespace then does exact match.
   * Subclasses may override for language-specific comparison.
   */
  protected validate(actualOutput: string, expectedOutput: string): boolean {
    return actualOutput.trim() === expectedOutput.trim();
  }

  // ─────────────────────────────────────────────────────
  //  Private helpers
  // ─────────────────────────────────────────────────────

  private buildResult(
    testCase: TestCase,
    data: {
      passed: boolean;
      actualOutput: string;
      runtime: number;
      memoryUsed: number;
      error?: string;
    },
  ): TestCaseResult {
    return {
      testCaseId: testCase.id,
      passed: data.passed,
      actualOutput: data.actualOutput,
      expectedOutput: testCase.expectedOutput,
      runtime: Math.round(data.runtime * 100) / 100,
      memoryUsed: Math.round(data.memoryUsed * 100) / 100,
      ...(data.error ? { error: data.error } : {}),
    };
  }
}
