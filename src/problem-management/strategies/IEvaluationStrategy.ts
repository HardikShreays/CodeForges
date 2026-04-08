/**
 * @module Strategies
 * @description Evaluation Strategy interface.
 *
 * Abstraction: Hides the implementation details of how answers are evaluated.
 */

export interface IEvaluationStrategy {
  evaluate(expected: string, actual: string): boolean;
}
