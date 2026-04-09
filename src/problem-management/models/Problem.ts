/**
 * @module Models
 * @description Problem model.
 *
 * Encapsulation: all fields are private, accessed only through getters and specific mutators.
 */

import { TestCase } from './TestCase';

export class Problem {
  private _id: string;
  private _title: string;
  private _description: string;
  private _difficulty: "EASY" | "MEDIUM" | "HARD";
  private _testCases: TestCase[];

  constructor(id: string, title: string, description: string, difficulty: "EASY" | "MEDIUM" | "HARD") {
    this._id = id;
    this._title = title;
    this._description = description;
    this._difficulty = difficulty;
    this._testCases = [];
  }

  get id(): string {
    return this._id;
  }

  get title(): string {
    return this._title;
  }

  set title(value: string) {
    this._title = value;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  get difficulty(): "EASY" | "MEDIUM" | "HARD" {
    return this._difficulty;
  }

  set difficulty(value: "EASY" | "MEDIUM" | "HARD") {
    this._difficulty = value;
  }

  get testCases(): TestCase[] {
    return [...this._testCases]; // return a copy to preserve encapsulation
  }

  public addTestCase(testCase: TestCase): void {
    this._testCases.push(testCase);
  }
}
