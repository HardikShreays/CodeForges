/**
 * @module Factory
 * @description Factory Pattern — LanguageExecutorFactory
 *
 * Creates the correct executor instance based on language string.
 *
 * SOLID principles applied:
 *  - SRP: Factory has one job — instantiation.
 *  - OCP: New languages are added by calling registerExecutor(),
 *         NOT by modifying existing factory code.
 *  - DIP: Returns ExecutorInterface, not concrete classes.
 *
 * The registry map makes this a **registry-based** factory,
 * superior to a switch-case factory for extensibility.
 */

import { ExecutorInterface } from '../types';
import { PythonExecutor } from '../executors/PythonExecutor';
import { JavaExecutor } from '../executors/JavaExecutor';
import { CPPExecutor } from '../executors/CPPExecutor';

/** Creator function signature for lazy instantiation */
type ExecutorCreator = () => ExecutorInterface;

export class LanguageExecutorFactory {
  /**
   * Registry of language → executor creator functions.
   * Using creator functions (not instances) enables fresh
   * executor per request — important for isolation.
   */
  private readonly registry = new Map<string, ExecutorCreator>();

  constructor() {
    // Register built-in languages
    this.registerExecutor('python', () => new PythonExecutor());
    this.registerExecutor('java', () => new JavaExecutor());
    this.registerExecutor('cpp', () => new CPPExecutor());
    this.registerExecutor('c++', () => new CPPExecutor()); // alias
  }

  /**
   * Register a new language executor.
   * Enables OCP — extend without modifying existing code.
   *
   * @param language  Lowercase language identifier
   * @param creator   Factory function returning a fresh ExecutorInterface
   */
  public registerExecutor(language: string, creator: ExecutorCreator): void {
    this.registry.set(language.toLowerCase(), creator);
  }

  /**
   * Get an executor for the specified language.
   *
   * @throws {Error} if language is not registered
   */
  public getExecutor(language: string): ExecutorInterface {
    const normalised = language.toLowerCase().trim();
    const creator = this.registry.get(normalised);

    if (!creator) {
      const supported = Array.from(this.registry.keys()).join(', ');
      throw new Error(
        `Unsupported language: "${language}". Supported languages: ${supported}`,
      );
    }

    return creator();
  }

  /**
   * Check if a language is supported.
   */
  public isSupported(language: string): boolean {
    return this.registry.has(language.toLowerCase().trim());
  }

  /**
   * List all supported languages.
   */
  public getSupportedLanguages(): string[] {
    return Array.from(this.registry.keys());
  }
}
