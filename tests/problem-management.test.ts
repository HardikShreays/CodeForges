import { ProblemService } from '../src/problem-management/services/ProblemService';
import { Evaluator } from '../src/problem-management/services/Evaluator';
import { ExactMatchStrategy } from '../src/problem-management/strategies/ExactMatchStrategy';
import { ToleranceStrategy } from '../src/problem-management/strategies/ToleranceStrategy';

describe('Problem Management Module', () => {
  describe('ProblemService', () => {
    let problemService: ProblemService;

    beforeEach(() => {
      problemService = new ProblemService();
    });

    it('should create a problem successfully', () => {
      const problem = problemService.createProblem('P001', 'Two Sum', 'Find two numbers', 'EASY');
      expect(problem.id).toBe('P001');
      expect(problem.title).toBe('Two Sum');
    });

    it('should throw error when creating duplicate problem', () => {
      problemService.createProblem('P001', 'Two Sum', 'Find two numbers', 'EASY');
      expect(() => {
        problemService.createProblem('P001', 'Three Sum', 'Find three', 'MEDIUM');
      }).toThrow('Problem with ID P001 already exists');
    });

    it('should get a problem successfully', () => {
      problemService.createProblem('P002', 'Max Subarray', 'Find max', 'MEDIUM');
      const problem = problemService.getProblem('P002');
      expect(problem.id).toBe('P002');
    });

    it('should throw error if problem not found', () => {
      expect(() => {
        problemService.getProblem('P999');
      }).toThrow('Problem P999 not found');
    });
  });

  describe('Strategies and Evaluator', () => {
    it('ExactMatchStrategy should pass and fail correctly', () => {
      const strategy = new ExactMatchStrategy();
      const evaluator = new Evaluator(strategy);

      expect(evaluator.evaluateAnswer('10', '10')).toBe(true);
      expect(evaluator.evaluateAnswer(' 10 ', '10 ')).toBe(true);
      expect(evaluator.evaluateAnswer('10', '11')).toBe(false);
    });

    it('ToleranceStrategy should handle within and outside tolerance', () => {
      const strategy = new ToleranceStrategy(0.1);
      const evaluator = new Evaluator(strategy);

      expect(evaluator.evaluateAnswer('1.0', '1.05')).toBe(true);
      expect(evaluator.evaluateAnswer('1.0', '1.2')).toBe(false);
    });

    it('Evaluator should allow strategy swapping at runtime', () => {
      const exactMatch = new ExactMatchStrategy();
      const evaluator = new Evaluator(exactMatch);

      // Fails exact match
      expect(evaluator.evaluateAnswer('1.5', '1.51')).toBe(false);

      // Swap to tolerance
      const tolerance = new ToleranceStrategy(0.05);
      evaluator.setStrategy(tolerance);

      // Now passes
      expect(evaluator.evaluateAnswer('1.5', '1.51')).toBe(true);
    });
  });
});
