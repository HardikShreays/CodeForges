/**
 * @module Executors / JavaExecutor
 *
 * Simulates execution of Java code.
 * Java is a compiled language — overrides compile() to simulate javac.
 *
 * LSP: Fully substitutable for BaseExecutor / ExecutorInterface.
 */

import { CompilationResult, RunResult } from '../types';
import { BaseExecutor } from '../templates';

export class JavaExecutor extends BaseExecutor {
  public readonly language = 'java' as const;

  /**
   * Simulates Java compilation (javac).
   * Checks for missing class declarations, missing main methods,
   * and unclosed braces.
   */
  protected override compile(code: string): CompilationResult {
    const errors: string[] = [];

    // Check for class declaration
    if (!code.includes('class ')) {
      errors.push('error: class declaration not found');
    }

    // Check for main method
    if (!code.includes('public static void main')) {
      errors.push('error: missing main method — public static void main(String[] args)');
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

    // Simulate successful compilation → bytecode placeholder
    return {
      success: true,
      compiledCode: `[JAVA_BYTECODE] ${code}`,
      errors: [],
    };
  }

  /**
   * Simulates running compiled Java bytecode.
   */
  protected run(compiledCode: string, input: string): RunResult {
    const startTime = performance.now();
    const baseMemory = 30 + Math.random() * 20; // 30-50 MB typical for JVM

    try {
      const sourceCode = compiledCode.replace('[JAVA_BYTECODE] ', '');

      // Detect runtime errors
      if (sourceCode.includes('throw new')) {
        return {
          output: '',
          runtime: performance.now() - startTime + Math.random() * 80,
          memoryUsed: baseMemory,
          error: 'Exception in thread "main" java.lang.RuntimeException: Simulated exception',
        };
      }

      if (sourceCode.includes('null.') || sourceCode.includes('null;')) {
        return {
          output: '',
          runtime: performance.now() - startTime + Math.random() * 60,
          memoryUsed: baseMemory,
          error: 'Exception in thread "main" java.lang.NullPointerException',
        };
      }

      // Simulate output extraction
      const output = this.simulateOutput(sourceCode, input);

      return {
        output,
        runtime: performance.now() - startTime + Math.random() * 120,
        memoryUsed: baseMemory + Math.random() * 10,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        output: '',
        runtime: performance.now() - startTime,
        memoryUsed: baseMemory,
        error: `JavaExecutor internal error: ${message}`,
      };
    }
  }

  /**
   * Extract System.out.println(...) content.
   */
  private simulateOutput(code: string, input: string): string {
    // Scanner-based input echo
    if (code.includes('Scanner') && code.includes('println')) {
      const printMatch = code.match(/System\.out\.println\((.+?)\)/);
      if (printMatch) {
        const expr = printMatch[1]!.trim();
        if (expr.includes('next') || expr.includes('scanner') || expr.includes('input')) {
          return input.trim();
        }
      }
      return input.trim();
    }

    // Direct print statements
    const printMatch = code.match(/System\.out\.println\((.+?)\)/);
    if (printMatch) {
      const expr = printMatch[1]!.trim();

      // String literal
      const strMatch = expr.match(/^"(.*)"$/);
      if (strMatch) {
        return strMatch[1]!;
      }

      // Numeric expression
      try {
        const numericInput = parseFloat(input.trim());
        if (!isNaN(numericInput) && /^[\d\s+\-*/().]+$/.test(expr)) {
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
