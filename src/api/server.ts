/**
 * @file src/api/server.ts
 * @description Express server setup for the CodeForges API.
 *
 * Mounts all route modules under /api and starts
 * the server on the configured port (default 3000).
 *
 * Run with:  npx ts-node src/api/server.ts
 */

import express from 'express';
import { problemRoutes, submissionRoutes, executionRoutes, evaluateRoutes } from './routes';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ── Middleware ────────────────────────────────────────────
app.use(express.json());

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'CodeForges',
    timestamp: new Date().toISOString(),
  });
});

// ── Mount routes ─────────────────────────────────────────
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/execute', executionRoutes);
app.use('/api/evaluate', evaluateRoutes);

// ── 404 fallback ─────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Start server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║         CodeForges API — Running                        ║');
  console.log(`║         Port: ${PORT}                                       ║`);
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('  Available endpoints:');
  console.log('');
  console.log('  GET    /api/health                    — Health check');
  console.log('');
  console.log('  POST   /api/problems                  — Create a problem');
  console.log('  GET    /api/problems                  — List all problems');
  console.log('  GET    /api/problems/:id              — Get a problem');
  console.log('  PATCH  /api/problems/:id              — Update a problem');
  console.log('  POST   /api/problems/:id/testcase     — Add test case');
  console.log('');
  console.log('  POST   /api/submissions               — Submit code');
  console.log('  POST   /api/submissions/process       — Process queue');
  console.log('  GET    /api/submissions/:id/status    — Get status');
  console.log('  GET    /api/submissions/:id/result    — Get result');
  console.log('');
  console.log('  POST   /api/execute                   — Run code directly');
  console.log('  GET    /api/execute/languages         — List languages');
  console.log('');
  console.log('  POST   /api/evaluate                  — Evaluate output');
  console.log('');
});

export default app;
