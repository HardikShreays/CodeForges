/**
 * @module execution-engine
 * @description Public API barrel export for the Execution Engine module.
 *
 * Usage:
 *   import { ExecutionEngine, LanguageExecutorFactory } from './execution-engine';
 */

// Core
export { ExecutionEngine } from './core';

// Factory
export { LanguageExecutorFactory } from './factory';

// Templates
export { BaseExecutor } from './templates';

// Executors
export { PythonExecutor, JavaExecutor, CPPExecutor } from './executors';

// Types
export {
  TestCase,
  TestCaseResult,
  ExecutionResult,
  ExecutionStatus,
  ExecutorInterface,
  CompilationResult,
  RunResult,
} from './types';
