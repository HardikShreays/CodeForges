/**
 * @module Types
 * @description Core interfaces for the Execution Engine.
 *
 * These contracts define the shape of data flowing through the system,
 * ensuring loose coupling between components (Dependency Inversion Principle).
 */

// ─────────────────────────────────────────────────────────
//  Test Case
// ─────────────────────────────────────────────────────────

/**
 * Represents a single test case to be executed against submitted code.
 */
export interface TestCase {
  /** Unique identifier for the test case */
  id: string;

  /** Input string passed to the program's stdin */
  input: string;

  /** Expected output the program should produce */
  expectedOutput: string;

  /** Maximum time (ms) allowed for this test case */
  timeLimit?: number;

  /** Maximum memory (MB) allowed for this test case */
  memoryLimit?: number;
}

// ─────────────────────────────────────────────────────────
//  Test Case Result
// ─────────────────────────────────────────────────────────

/**
 * Outcome of running a single test case.
 */
export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  runtime: number;      // milliseconds
  memoryUsed: number;   // megabytes
  error?: string;
}

// ─────────────────────────────────────────────────────────
//  Execution Result
// ─────────────────────────────────────────────────────────

export type ExecutionStatus =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'COMPILATION_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED';

/**
 * Aggregated result for the entire submission.
 */
export interface ExecutionResult {
  status: ExecutionStatus;
  passed: number;
  failed: number;
  totalTests: number;
  runtime: number;       // total milliseconds
  memoryUsed: number;    // peak megabytes
  results: TestCaseResult[];
  errors: string[];
}

// ─────────────────────────────────────────────────────────
//  Executor Interface  (Dependency Inversion)
// ─────────────────────────────────────────────────────────

/**
 * Contract every language executor must honour.
 *
 * High-level modules (ExecutionEngine) depend on this abstraction,
 * NOT on concrete executor classes.
 */
export interface ExecutorInterface {
  /** Human-readable language name */
  readonly language: string;

  /**
   * Execute the given source code against a single test case
   * and return a structured result.
   */
  execute(code: string, testCase: TestCase): TestCaseResult;
}

// ─────────────────────────────────────────────────────────
//  Compilation Result  (internal detail)
// ─────────────────────────────────────────────────────────

export interface CompilationResult {
  success: boolean;
  compiledCode: string;
  errors: string[];
}

// ─────────────────────────────────────────────────────────
//  Run Result  (internal detail)
// ─────────────────────────────────────────────────────────

export interface RunResult {
  output: string;
  runtime: number;
  memoryUsed: number;
  error?: string;
}
