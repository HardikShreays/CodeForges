import { ExecutionEngine } from '../execution-engine';
import { TestCase, ExecutionResult } from '../execution-engine/types';
import { Language } from './types';

/**
 * ExecutionManager
 *  - Singleton wrapper around ExecutionEngine.
 *  - Central place to configure limits, logging, and future cross-cutting concerns.
 */
export class ExecutionManager {
  private static instance: ExecutionManager | null = null;

  private readonly engine: ExecutionEngine;

  private constructor() {
    this.engine = new ExecutionEngine();
  }

  public static getInstance(): ExecutionManager {
    if (!ExecutionManager.instance) {
      ExecutionManager.instance = new ExecutionManager();
    }
    return ExecutionManager.instance;
  }

  public execute(
    code: string,
    language: Language,
    testCases: TestCase[],
  ): ExecutionResult {
    return this.engine.run(code, language, testCases);
  }

  public getSupportedLanguages(): string[] {
    return this.engine.getSupportedLanguages();
  }
}

