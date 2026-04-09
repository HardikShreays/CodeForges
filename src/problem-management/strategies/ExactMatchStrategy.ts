/**
 * @module Strategies
 * @description Exact Match Strategy.
 *
 * LSP: Swappable without breaking the Evaluator.
 */

import { IEvaluationStrategy } from './IEvaluationStrategy';

export class ExactMatchStrategy implements IEvaluationStrategy {
  public evaluate(expected: string, actual: string): boolean {
    return expected.trim() === actual.trim();
  }
}
