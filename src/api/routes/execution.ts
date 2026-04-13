/**
 * @file src/api/routes/execution.ts
 * @description REST routes for direct Execution Engine access.
 *
 * Endpoints:
 *   POST  /api/execute            — Run code directly against test cases
 *   GET   /api/execute/languages  — List supported languages
 */

import { Router, Request, Response } from 'express';
import { ExecutionEngine } from '../../execution-engine';

const router = Router();
const engine = new ExecutionEngine();

// ── POST /api/execute ────────────────────────────────────
router.post('/', (req: Request, res: Response) => {
  try {
    const { code, language, testCases } = req.body;

    if (!code || !language || !testCases) {
      res.status(400).json({ error: 'Missing required fields: code, language, testCases' });
      return;
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
      res.status(400).json({ error: 'testCases must be a non-empty array' });
      return;
    }

    if (!engine.isLanguageSupported(language)) {
      res.status(400).json({
        error: `Unsupported language: "${language}". Supported: ${engine.getSupportedLanguages().join(', ')}`,
      });
      return;
    }

    const result = engine.run(code, language, testCases);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
});

// ── GET /api/execute/languages ───────────────────────────
router.get('/languages', (_req: Request, res: Response) => {
  res.json({ languages: engine.getSupportedLanguages() });
});

export { router as executionRoutes };
