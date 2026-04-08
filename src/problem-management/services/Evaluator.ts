/**
 * @module Services
 * @description Evaluator service.
 *
 * OCP: Open for extension (new strategies), closed for modification.
 * DIP: Depends on IEvaluationStrategy abstraction, not concrete classes.
 */

import { IEvaluationStrategy } from '../strategies/IEvaluationStrategy';

export class Evaluator {
  private _strategy: IEvaluationStrategy;

  constructor(strategy: IEvaluationStrategy) {
    this._strategy = strategy;
  }

  public setStrategy(strategy: IEvaluationStrategy): void {
    this._strategy = strategy;
  }

  public evaluateAnswer(expected: string, actual: string): boolean {
    return this._strategy.evaluate(expected, actual);
  }
}
