/**
 * @module Models
 * @description TestCase model.
 *
 * Encapsulation: all fields are private, accessed only through getters.
 */

export class TestCase {
  private _input: string;
  private _expectedOutput: string;

  constructor(input: string, expectedOutput: string) {
    this._input = input;
    this._expectedOutput = expectedOutput;
  }

  get input(): string {
    return this._input;
  }

  get expectedOutput(): string {
    return this._expectedOutput;
  }
}
