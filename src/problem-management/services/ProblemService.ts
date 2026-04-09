/**
 * @module Services
 * @description Problem Service.
 *
 * SRP: Manages problem lifecycle and delegates business rules where necessary.
 */

import { IProblemService } from '../types';
import { Problem } from '../models/Problem';
import { TestCase } from '../models/TestCase';

export class ProblemService implements IProblemService {
  private readonly _problems: Map<string, Problem>;

  constructor() {
    this._problems = new Map<string, Problem>();
  }

  public createProblem(id: string, title: string, description: string, difficulty: "EASY" | "MEDIUM" | "HARD"): Problem {
    if (this._problems.has(id)) {
      throw new Error(`Problem with ID ${id} already exists`);
    }
    const newProblem = new Problem(id, title, description, difficulty);
    this._problems.set(id, newProblem);
    return newProblem;
  }

  public getProblem(id: string): Problem {
    const problem = this._problems.get(id);
    if (!problem) {
      throw new Error(`Problem ${id} not found`);
    }
    return problem;
  }

  public listProblems(): Problem[] {
    return Array.from(this._problems.values());
  }

  public updateProblem(id: string, fields: Partial<{ title: string; description: string; difficulty: "EASY" | "MEDIUM" | "HARD" }>): Problem {
    const problem = this.getProblem(id);
    
    if (fields.title) {
        problem.title = fields.title;
    }
    if (fields.description) {
        problem.description = fields.description;
    }
    if (fields.difficulty) {
        problem.difficulty = fields.difficulty;
    }

    return problem;
  }

  public addTestCase(problemId: string, input: string, expectedOutput: string): void {
    const problem = this.getProblem(problemId);
    const testCase = new TestCase(input, expectedOutput);
    problem.addTestCase(testCase);
  }
}
