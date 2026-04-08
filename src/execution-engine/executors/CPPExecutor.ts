/**
 * @module Executors / CPPExecutor
 *
 * Simulates execution of C++ code.
 * C++ is a compiled language — overrides compile() to simulate g++.
 *
 * LSP: Fully substitutable for BaseExecutor / ExecutorInterface.
 */

import { CompilationResult, RunResult } from '../types';
import { BaseExecutor } from '../templates';

export class CPPExecutor extends BaseExecutor {
  public readonly language = 'cpp' as const;

  /**
   * Simulates C++ compilation (g++).
   * Validates #include, main function, and brace matching.
   */
  protected override compile(code: string): CompilationResult {
    const errors: string[] = [];

    // Check for main function
    if (!code.includes('int main')) {
      errors.push("error: 'main' must return 'int'");
    }

    // Check for iostream if using cout
    if (code.includes('cout') && !code.includes('#include')) {
      errors.push("error: 'cout' was not declared in this scope — missing #include <iostream>");
    }

    // Missing semicolons (rough heuristic — check lines that should end with ;)
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!.trim();
      if (
        line.length > 0 &&
        !line.startsWith('#') &&
        !line.startsWith('//') &&
        !line.startsWith('/*') &&
        !line.startsWith('*') &&
        !line.endsWith('{') &&
        !line.endsWith('}') &&
        !line.endsWith(';') &&
        !line.endsWith(')') &&
        !line.includes('int main') &&
        !line.includes('if') &&
        !line.includes('else') &&
        !line.includes('for') &&
        !line.includes('while') &&
        line.includes('cout')
      ) {
        errors.push(`error: expected ';' at end of line ${i + 1}`);
      }
    }

    // Brace matching
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push(`error: unbalanced braces — ${openBraces} open vs ${closeBraces} close`);
    }

    if (errors.length > 0) {
      return { success: false, compiledCode: '', errors };
    }

    return {
      success: true,
      compiledCode: `[CPP_BINARY] ${code}`,
      errors: [],
    };
  }

  /**
   * Simulates running compiled C++ binary.
   */
  protected run(compiledCode: string, input: string): RunResult {
    const startTime = performance.now();
    const baseMemory = 2 + Math.random() * 4; // 2-6 MB typical for C++

    try {
      const sourceCode = compiledCode.replace('[CPP_BINARY] ', '');

      // Detect segfault simulation
      if (sourceCode.includes('nullptr') || sourceCode.includes('NULL')) {
        return {
          output: '',
          runtime: performance.now() - startTime + Math.random() * 20,
          memoryUsed: baseMemory,
          error: 'Segmentation fault (core dumped)',
        };
      }

      // Detect out-of-bounds simulation
      if (sourceCode.includes('out_of_range') || sourceCode.includes('throw')) {
        return {
          output: '',
          runtime: performance.now() - startTime + Math.random() * 25,
          memoryUsed: baseMemory,
          error: 'terminate called after throwing an instance of \'std::out_of_range\'',
        };
      }

      const output = this.simulateOutput(sourceCode, input);

      return {
        output,
        runtime: performance.now() - startTime + Math.random() * 40,
        memoryUsed: baseMemory + Math.random() * 2,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        output: '',
        runtime: performance.now() - startTime,
        memoryUsed: baseMemory,
        error: `CPPExecutor internal error: ${message}`,
      };
    }
  }

  /**
   * Extract cout << ... content.
   */
  private simulateOutput(code: string, input: string): string {
    // cin-based input echo
    if (code.includes('cin') && code.includes('cout')) {
      const coutMatch = code.match(/cout\s*<<\s*(.+?)(?:\s*<<\s*endl)?;/);
      if (coutMatch) {
        const expr = coutMatch[1]!.trim();
        if (expr.includes('input') || /^[a-z_]\w*$/i.test(expr)) {
          return input.trim();
        }
      }
      return input.trim();
    }

    // Direct cout
    const coutMatch = code.match(/cout\s*<<\s*(.+?)(?:\s*<<\s*endl)?;/);
    if (coutMatch) {
      const expr = coutMatch[1]!.trim();

      // String literal
      const strMatch = expr.match(/^"(.*)"$/);
      if (strMatch) {
        return strMatch[1]!;
      }

      // Numeric expression
      try {
        if (/^[\d\s+\-*/().]+$/.test(expr)) {
          const result = Function(`"use strict"; return (${expr})`)() as number;
          return String(result);
        }
      } catch {
        // Fall through
      }

      return expr;
    }

    return '';
  }
}
