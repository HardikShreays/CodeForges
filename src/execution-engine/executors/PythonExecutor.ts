/**
 * @module Executors / PythonExecutor
 *
 * Simulates execution of Python code.
 * Python is interpreted, so compile() uses the default (no-op) hook.
 *
 * LSP: Fully substitutable for BaseExecutor / ExecutorInterface.
 */

import { RunResult } from '../types';
import { BaseExecutor } from '../templates';

export class PythonExecutor extends BaseExecutor {
  public readonly language = 'python' as const;

  /**
   * Simulates running Python code.
   *
   * In a production system this would invoke a sandboxed Python
   * interpreter. Here we simulate:
   *   - reads `print(...)` calls and resolves simple expressions
   *   - detects common runtime errors
   */
  protected run(compiledCode: string, input: string): RunResult {
    const startTime = performance.now();
    const baseMemory = 8 + Math.random() * 12; // 8-20 MB typical for Python

    try {
      // Simulate: detect syntax-level runtime errors
      if (compiledCode.includes('raise Exception')) {
        return {
          output: '',
          runtime: performance.now() - startTime + Math.random() * 50,
          memoryUsed: baseMemory,
          error: 'Exception: Simulated runtime exception in Python',
        };
      }

      if (compiledCode.includes('1/0') || compiledCode.includes('1 / 0')) {
        return {
          output: '',
          runtime: performance.now() - startTime + Math.random() * 30,
          memoryUsed: baseMemory,
          error: 'ZeroDivisionError: division by zero',
        };
      }

      // Simulate output: extract print(...) content
      const output = this.simulateOutput(compiledCode, input);

      return {
        output,
        runtime: performance.now() - startTime + Math.random() * 100,
        memoryUsed: baseMemory + Math.random() * 5,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        output: '',
        runtime: performance.now() - startTime,
        memoryUsed: baseMemory,
        error: `PythonExecutor internal error: ${message}`,
      };
    }
  }

  /**
   * Simple simulation: if the code contains `print(input)`,
   * we echo the input. Otherwise extract the first `print("...")`
   * string literal.
   */
  private simulateOutput(code: string, input: string): string {
    // Pattern: print(input) — echo stdin
    if (code.includes('print(input)') || code.includes('print(input())')) {
      return input.trim();
    }

    // Pattern: x = input() ... print(x) — variable assignment from input
    const assignMatch = code.match(/(\w+)\s*=\s*input\(\)/);
    if (assignMatch) {
      const varName = assignMatch[1]!;
      if (code.includes(`print(${varName})`)) {
        return input.trim();
      }
    }

    // Pattern: print(<expression>) — evaluate simple math on input
    const mathMatch = code.match(/print\((.+?)\)/);
    if (mathMatch) {
      const expr = mathMatch[1]!.trim();

      // If expression references input, try to evaluate
      if (expr === 'input' || expr === 'input()') {
        return input.trim();
      }

      // String literal
      const strMatch = expr.match(/^["'](.*)["']$/);
      if (strMatch) {
        return strMatch[1]!;
      }

      // Try numeric evaluation with input substitution
      try {
        const numericInput = parseFloat(input.trim());
        if (!isNaN(numericInput)) {
          const evaluated = expr
            .replace(/int\(input\(\)\)/g, String(numericInput))
            .replace(/input/g, String(numericInput));
          // Safe eval for simple arithmetic only
          if (/^[\d\s+\-*/().]+$/.test(evaluated)) {
            const result = Function(`"use strict"; return (${evaluated})`)() as number;
            return String(result);
          }
        }
      } catch {
        // Fall through
      }

      return expr;
    }

    return '';
  }
}
