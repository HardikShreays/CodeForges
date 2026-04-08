/**
 * @module Strategies
 * @description Tolerance Strategy for floating point numbers.
 *
 * LSP: Swappable without breaking the Evaluator.
 */

import { IEvaluationStrategy } from './IEvaluationStrategy';

export class ToleranceStrategy implements IEvaluationStrategy {
  private readonly _tolerance: number;

  constructor(tolerance: number = 1e-6) {
    this._tolerance = tolerance;
  }

  public evaluate(expected: string, actual: string): boolean {
    const expectedNum = parseFloat(expected.trim());
    const actualNum = parseFloat(actual.trim());
    
    if (isNaN(expectedNum) || isNaN(actualNum)) {
      return false;
    }
    
    return Math.abs(expectedNum - actualNum) <= this._tolerance;
  }
}
