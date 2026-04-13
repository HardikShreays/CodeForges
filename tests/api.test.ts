/**
 * @file tests/api.test.ts
 * @description Integration tests for the CodeForges REST API.
 *
 * Spins up the Express server, hits every endpoint, validates responses,
 * then shuts down. Run with:  npm run test:api
 */

import http from 'http';
import app from '../src/server';

// ─────────────────────────────────────────────────────────
//  Test helpers
// ─────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition: boolean, description: string): void {
  if (condition) {
    console.log(`  ✅ ${description}`);
    passed++;
  } else {
    console.error(`  ❌ ${description}`);
    failed++;
  }
}

interface HttpResponse {
  status: number;
  body: Record<string, unknown>;
}

function request(
  method: string,
  path: string,
  body?: Record<string, unknown>,
): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : undefined;
    const options: http.RequestOptions = {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode ?? 0, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode ?? 0, body: { raw } });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ─────────────────────────────────────────────────────────
//  Server lifecycle
// ─────────────────────────────────────────────────────────

const TEST_PORT = 4567;
let server: http.Server;

function startServer(): Promise<void> {
  return new Promise((resolve) => {
    server = app.listen(TEST_PORT, () => resolve());
  });
}

function stopServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}

// ─────────────────────────────────────────────────────────
//  Tests
// ─────────────────────────────────────────────────────────

async function runApiTests(): Promise<void> {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║          API INTEGRATION TESTS                           ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  await startServer();

  // ── Health Check ─────────────────────────────────────
  console.log('▸ Health Check');
  {
    const res = await request('GET', '/api/health');
    assert(res.status === 200, 'GET /api/health returns 200');
    assert(res.body.status === 'ok', 'Health status is "ok"');
  }

  // ── Problem Management ────────────────────────────────
  console.log('\n▸ Create Problem');
  {
    const res = await request('POST', '/api/problems', {
      id: 'ECHO',
      title: 'Echo Problem',
      description: 'Print the input as-is',
      difficulty: 'EASY',
    });
    assert(res.status === 201, 'POST /api/problems returns 201');
    assert((res.body.problem as Record<string, unknown>)?.id === 'ECHO', 'Created problem has id "ECHO"');
  }

  console.log('\n▸ Create Problem — validation');
  {
    const res = await request('POST', '/api/problems', { id: 'X' });
    assert(res.status === 400, 'Missing fields returns 400');
  }

  console.log('\n▸ Create Problem — duplicate');
  {
    const res = await request('POST', '/api/problems', {
      id: 'ECHO',
      title: 'Dup',
      description: 'dup',
      difficulty: 'EASY',
    });
    assert(res.status === 409, 'Duplicate ID returns 409');
  }

  console.log('\n▸ List Problems');
  {
    const res = await request('GET', '/api/problems');
    assert(res.status === 200, 'GET /api/problems returns 200');
    assert(Array.isArray(res.body.problems), 'Response has problems array');
    assert((res.body.problems as unknown[]).length === 1, 'Contains 1 problem');
  }

  console.log('\n▸ Get Problem by ID');
  {
    const res = await request('GET', '/api/problems/ECHO');
    assert(res.status === 200, 'GET /api/problems/ECHO returns 200');
    assert(res.body.title === 'Echo Problem', 'Title matches');
  }

  console.log('\n▸ Get Problem — not found');
  {
    const res = await request('GET', '/api/problems/NOPE');
    assert(res.status === 404, 'Non-existent problem returns 404');
  }

  console.log('\n▸ Update Problem');
  {
    const res = await request('PATCH', '/api/problems/ECHO', {
      title: 'Updated Echo',
      difficulty: 'MEDIUM',
    });
    assert(res.status === 200, 'PATCH returns 200');
    assert((res.body.problem as Record<string, unknown>)?.title === 'Updated Echo', 'Title updated');
    assert((res.body.problem as Record<string, unknown>)?.difficulty === 'MEDIUM', 'Difficulty updated');
  }

  console.log('\n▸ Add Test Cases');
  {
    const res1 = await request('POST', '/api/problems/ECHO/testcase', {
      input: '5',
      expectedOutput: '5',
    });
    assert(res1.status === 201, 'First test case added (201)');

    const res2 = await request('POST', '/api/problems/ECHO/testcase', {
      input: 'hello',
      expectedOutput: 'hello',
    });
    assert(res2.status === 201, 'Second test case added (201)');
  }

  // ── Execution Engine (Direct) ──────────────────────────
  console.log('\n▸ Get Supported Languages');
  {
    const res = await request('GET', '/api/execute/languages');
    assert(res.status === 200, 'GET /api/execute/languages returns 200');
    assert(Array.isArray(res.body.languages), 'Response has languages array');
    assert((res.body.languages as string[]).includes('python'), 'Includes python');
  }

  console.log('\n▸ Execute Code Directly');
  {
    const res = await request('POST', '/api/execute', {
      code: 'x = input()\nprint(x)',
      language: 'python',
      testCases: [
        { id: 'TC-1', input: '42', expectedOutput: '42' },
      ],
    });
    assert(res.status === 200, 'POST /api/execute returns 200');
    assert(res.body.status === 'ACCEPTED', 'Execution status is ACCEPTED');
    assert(res.body.passed === 1, 'Passed 1 test');
  }

  console.log('\n▸ Execute Code — unsupported language');
  {
    const res = await request('POST', '/api/execute', {
      code: 'puts "hi"',
      language: 'ruby',
      testCases: [{ id: 'TC-1', input: '1', expectedOutput: '1' }],
    });
    assert(res.status === 400, 'Unsupported language returns 400');
  }

  console.log('\n▸ Execute Code — validation');
  {
    const res = await request('POST', '/api/execute', { code: 'x' });
    assert(res.status === 400, 'Missing fields returns 400');
  }

  // ── Submissions Pipeline ──────────────────────────────
  console.log('\n▸ Submit Code');
  let submissionId = '';
  {
    const res = await request('POST', '/api/submissions', {
      problemId: 'ECHO',
      language: 'python',
      sourceCode: 'x = input()\nprint(x)',
    });
    assert(res.status === 201, 'POST /api/submissions returns 201');
    assert(typeof res.body.submissionId === 'string', 'Returns a submissionId');
    assert(res.body.status === 'QUEUED', 'Initial status is QUEUED');
    submissionId = res.body.submissionId as string;
  }

  console.log('\n▸ Submit Code — problem not found');
  {
    const res = await request('POST', '/api/submissions', {
      problemId: 'NOPE',
      language: 'python',
      sourceCode: 'print(1)',
    });
    assert(res.status === 404, 'Non-existent problem returns 404');
  }

  console.log('\n▸ Get Submission Status (before processing)');
  {
    const res = await request('GET', `/api/submissions/${submissionId}/status`);
    assert(res.status === 200, 'GET status returns 200');
    assert(res.body.status === 'QUEUED', 'Status is still QUEUED');
  }

  console.log('\n▸ Process Queue');
  {
    const res = await request('POST', '/api/submissions/process');
    assert(res.status === 200, 'POST /api/submissions/process returns 200');
  }

  console.log('\n▸ Get Submission Status (after processing)');
  {
    const res = await request('GET', `/api/submissions/${submissionId}/status`);
    assert(res.status === 200, 'GET status returns 200');
    assert(res.body.status === 'COMPLETED' || res.body.status === 'FAILED', 'Status is COMPLETED or FAILED');
  }

  console.log('\n▸ Get Submission Result');
  {
    const res = await request('GET', `/api/submissions/${submissionId}/result`);
    assert(res.status === 200, 'GET result returns 200');
    assert(typeof res.body.passed === 'number', 'Result has passed count');
    assert(typeof res.body.totalTests === 'number', 'Result has totalTests count');
  }

  // ── Evaluator ──────────────────────────────────────────
  console.log('\n▸ Evaluate — exact match (pass)');
  {
    const res = await request('POST', '/api/evaluate', {
      expected: '10',
      actual: '10',
      strategy: 'exact',
    });
    assert(res.status === 200, 'POST /api/evaluate returns 200');
    assert(res.body.passed === true, 'Exact match passes');
  }

  console.log('\n▸ Evaluate — exact match (fail)');
  {
    const res = await request('POST', '/api/evaluate', {
      expected: '10',
      actual: '11',
      strategy: 'exact',
    });
    assert(res.body.passed === false, 'Exact match fails for different values');
  }

  console.log('\n▸ Evaluate — tolerance (pass)');
  {
    const res = await request('POST', '/api/evaluate', {
      expected: '3.14',
      actual: '3.141',
      strategy: 'tolerance',
      tolerance: 0.01,
    });
    assert(res.body.passed === true, 'Within tolerance passes');
  }

  console.log('\n▸ Evaluate — tolerance (fail)');
  {
    const res = await request('POST', '/api/evaluate', {
      expected: '3.14',
      actual: '4.0',
      strategy: 'tolerance',
      tolerance: 0.01,
    });
    assert(res.body.passed === false, 'Outside tolerance fails');
  }

  // ── 404 Route ──────────────────────────────────────────
  console.log('\n▸ Unknown route');
  {
    const res = await request('GET', '/api/does-not-exist');
    assert(res.status === 404, 'Unknown route returns 404');
  }

  // ── Summary ────────────────────────────────────────────
  console.log(`\n─── API Tests: ${passed} passed, ${failed} failed ───\n`);

  await stopServer();

  if (failed > 0) process.exit(1);
}

runApiTests().catch((err) => {
  console.error('Fatal error in API tests:', err);
  process.exit(1);
});
