/**
 * @module Strategies
 * @description Custom Checker Strategy.
 *
 * LSP: Swappable without breaking the Evaluator.
 */

import { IEvaluationStrategy } from './IEvaluationStrategy';

export type CheckerFunction = (expected: string, actual: string) => boolean;

export class CustomCheckerStrategy implements IEvaluationStrategy {
  private readonly _checker: CheckerFunction;

  constructor(checker: CheckerFunction) {
    this._checker = checker;
  }

  public evaluate(expected: string, actual: string): boolean {
    return this._checker(expected, actual);
  }
}
