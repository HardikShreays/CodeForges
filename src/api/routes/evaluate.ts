/**
 * @file src/api/routes/evaluate.ts
 * @description REST routes for the Evaluator / Strategy pattern demo.
 *
 * Endpoints:
 *   POST /api/evaluate — Evaluate expected vs actual output using a strategy
 */

import { Router, Request, Response } from 'express';
import { Evaluator } from '../../problem-management/services/Evaluator';
import { ExactMatchStrategy } from '../../problem-management/strategies/ExactMatchStrategy';
import { ToleranceStrategy } from '../../problem-management/strategies/ToleranceStrategy';

const router = Router();

// ── POST /api/evaluate ───────────────────────────────────
router.post('/', (req: Request, res: Response) => {
  try {
    const { expected, actual, strategy, tolerance } = req.body;

    if (expected === undefined || actual === undefined) {
      res.status(400).json({ error: 'Missing required fields: expected, actual' });
      return;
    }

    const strategyName = (strategy ?? 'exact').toLowerCase();
    let evaluationStrategy;

    switch (strategyName) {
      case 'exact':
        evaluationStrategy = new ExactMatchStrategy();
        break;
      case 'tolerance':
        evaluationStrategy = new ToleranceStrategy(tolerance ?? 1e-6);
        break;
      default:
        res.status(400).json({ error: `Unknown strategy: "${strategy}". Use "exact" or "tolerance".` });
        return;
    }

    const evaluator = new Evaluator(evaluationStrategy);
    const result = evaluator.evaluateAnswer(expected, actual);

    res.json({
      expected,
      actual,
      strategy: strategyName,
      ...(strategyName === 'tolerance' ? { tolerance: tolerance ?? 1e-6 } : {}),
      passed: result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

export { router as evaluateRoutes };
