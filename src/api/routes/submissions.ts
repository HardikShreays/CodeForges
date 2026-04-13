/**
 * @file src/api/routes/submissions.ts
 * @description REST routes for the Submission Service.
 *
 * Endpoints:
 *   POST   /api/submissions              — Submit code for evaluation
 *   POST   /api/submissions/process      — Process the job queue (worker simulation)
 *   GET    /api/submissions/:id/status   — Get submission status
 *   GET    /api/submissions/:id/result   — Get submission result
 */

import { Router, Request, Response } from 'express';
import { SubmissionService } from '../../submission-service/SubmissionService';
import { problemService } from './problems';

const router = Router();
const submissionService = new SubmissionService();

// ── POST /api/submissions ────────────────────────────────
router.post('/', (req: Request, res: Response) => {
  try {
    const { problemId, language, sourceCode } = req.body;

    if (!problemId || !language || !sourceCode) {
      res.status(400).json({ error: 'Missing required fields: problemId, language, sourceCode' });
      return;
    }

    // Check that the problem exists and get its test cases
    let problem;
    try {
      problem = problemService.getProblem(problemId);
    } catch {
      res.status(404).json({ error: `Problem ${problemId} not found. Create it first via POST /api/problems.` });
      return;
    }

    // Convert problem test cases to execution-engine format
    const testCases = problem.testCases.map((tc, i) => ({
      id: `TC-${i + 1}`,
      input: tc.input,
      expectedOutput: tc.expectedOutput,
    }));

    // Register test cases with the submission service
    submissionService.registerProblem(problemId, testCases);

    const submissionId = submissionService.submit({ problemId, language, sourceCode });

    res.status(201).json({
      message: 'Submission created and queued',
      submissionId,
      status: submissionService.getStatus(submissionId),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

// ── POST /api/submissions/process ────────────────────────
router.post('/process', (_req: Request, res: Response) => {
  try {
    submissionService.processQueue();
    res.json({ message: 'Queue processed successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

// ── GET /api/submissions/:id/status ──────────────────────
router.get('/:id/status', (req: Request, res: Response) => {
  const status = submissionService.getStatus(req.params.id as string);
  if (!status) {
    res.status(404).json({ error: `Submission ${req.params.id} not found` });
    return;
  }
  res.json({ submissionId: req.params.id, status });
});

// ── GET /api/submissions/:id/result ──────────────────────
router.get('/:id/result', (req: Request, res: Response) => {
  const result = submissionService.getResult(req.params.id as string);
  if (!result) {
    res.status(404).json({ error: `Result for submission ${req.params.id} not found. Has the queue been processed?` });
    return;
  }
  res.json(result);
});

export { router as submissionRoutes };
