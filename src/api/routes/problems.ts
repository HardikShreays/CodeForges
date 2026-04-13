/**
 * @file src/api/routes/problems.ts
 * @description REST routes for the Problem Management module.
 *
 * Endpoints:
 *   POST   /api/problems              — Create a problem
 *   GET    /api/problems              — List all problems
 *   GET    /api/problems/:id          — Get a single problem
 *   PATCH  /api/problems/:id          — Update a problem
 *   POST   /api/problems/:id/testcase — Add a test case to a problem
 */

import { Router, Request, Response } from 'express';
import { ProblemService } from '../../problem-management/services/ProblemService';

const router = Router();
const problemService = new ProblemService();

// ── POST /api/problems ───────────────────────────────────
router.post('/', (req: Request, res: Response) => {
  try {
    const { id, title, description, difficulty } = req.body;

    if (!id || !title || !description || !difficulty) {
      res.status(400).json({ error: 'Missing required fields: id, title, description, difficulty' });
      return;
    }

    const problem = problemService.createProblem(id, title, description, difficulty);
    res.status(201).json({
      message: 'Problem created successfully',
      problem: {
        id: problem.id,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        testCases: problem.testCases,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(409).json({ error: message });
  }
});

// ── GET /api/problems ────────────────────────────────────
router.get('/', (_req: Request, res: Response) => {
  const problems = problemService.listProblems().map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    difficulty: p.difficulty,
    testCases: p.testCases,
  }));
  res.json({ problems });
});

// ── GET /api/problems/:id ────────────────────────────────
router.get('/:id', (req: Request, res: Response) => {
  try {
    const p = problemService.getProblem(req.params.id as string);
    res.json({
      id: p.id,
      title: p.title,
      description: p.description,
      difficulty: p.difficulty,
      testCases: p.testCases,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(404).json({ error: message });
  }
});

// ── PATCH /api/problems/:id ──────────────────────────────
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const { title, description, difficulty } = req.body;
    const updated = problemService.updateProblem(req.params.id as string, { title, description, difficulty });
    res.json({
      message: 'Problem updated successfully',
      problem: {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        difficulty: updated.difficulty,
        testCases: updated.testCases,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(404).json({ error: message });
  }
});

// ── POST /api/problems/:id/testcase ──────────────────────
router.post('/:id/testcase', (req: Request, res: Response) => {
  try {
    const { input, expectedOutput } = req.body;

    if (input === undefined || expectedOutput === undefined) {
      res.status(400).json({ error: 'Missing required fields: input, expectedOutput' });
      return;
    }

    problemService.addTestCase(req.params.id as string, input, expectedOutput);
    const p = problemService.getProblem(req.params.id as string);
    res.status(201).json({
      message: 'Test case added',
      problem: {
        id: p.id,
        title: p.title,
        testCases: p.testCases,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(404).json({ error: message });
  }
});

export { router as problemRoutes, problemService };
