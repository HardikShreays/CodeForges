/**
 * @module Types
 * @description Core interfaces for the Problem Management Service.
 *
 * ISP: Interface Segregation Principle - IProblemRepository and IProblemService are separate.
 */

export interface ITestCase {
  input: string;
  expectedOutput: string;
}

export interface IProblem {
  id: string;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  testCases: ITestCase[];
}

export interface IProblemRepository {
  save(problem: IProblem): void;
  findById(id: string): IProblem | undefined;
  findAll(): IProblem[];
  delete(id: string): void;
}

export interface IProblemService {
  createProblem(id: string, title: string, description: string, difficulty: "EASY" | "MEDIUM" | "HARD"): IProblem;
  getProblem(id: string): IProblem;
  listProblems(): IProblem[];
  updateProblem(id: string, fields: Partial<Omit<IProblem, 'id' | 'testCases'>>): IProblem;
  addTestCase(problemId: string, input: string, expectedOutput: string): void;
}
