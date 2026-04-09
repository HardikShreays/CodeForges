import { ExecutionManager } from './ExecutionManager';
import { JobQueue } from './JobQueue';
import {
  SubmissionRequest,
  SubmissionRecord,
  SubmissionResultSummary,
  SubmissionStatus,
  QueueJob,
} from './types';
import { TestCase } from '../execution-engine/types';

/**
 * SubmissionService
 *  - Public API to accept submissions and expose their status.
 *  - Delegates execution to ExecutionManager via an internal JobQueue.
 */
export class SubmissionService {
  private readonly executionManager: ExecutionManager;
  private readonly jobQueue: JobQueue;

  private readonly submissions = new Map<string, SubmissionRecord>();
  private readonly results = new Map<string, SubmissionResultSummary>();

  private readonly testCasesByProblem = new Map<string, TestCase[]>();

  constructor(executionManager?: ExecutionManager, jobQueue?: JobQueue) {
    this.executionManager = executionManager ?? ExecutionManager.getInstance();
    this.jobQueue = jobQueue ?? new JobQueue();
  }

  /**
   * Registers test cases for a given problem.
   * This keeps SubmissionService self-contained for demo purposes.
   */
  registerProblem(problemId: string, testCases: TestCase[]): void {
    this.testCasesByProblem.set(problemId, testCases);
  }

  submit(request: SubmissionRequest): string {
    const id = `SUB-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const record: SubmissionRecord = {
      ...request,
      id,
      createdAt: new Date(),
      status: 'QUEUED',
    };

    this.submissions.set(id, record);

    const job: QueueJob = { submission: record };
    this.jobQueue.enqueue(job);

    return id;
  }

  /**
   * Processes all jobs currently in the queue.
   * For the course project, this simulates how a worker service would behave.
   */
  processQueue(): void {
    while (!this.jobQueue.isEmpty()) {
      const job = this.jobQueue.dequeue();
      if (!job) continue;

      const { submission } = job;
      const current = this.submissions.get(submission.id);
      if (!current) continue;

      this.updateStatus(submission.id, 'RUNNING');

      const testCases = this.testCasesByProblem.get(submission.problemId) ?? [];
      const executionResult = this.executionManager.execute(
        submission.sourceCode,
        submission.language,
        testCases,
      );

      const summary: SubmissionResultSummary = {
        submissionId: submission.id,
        status: executionResult.status === 'ACCEPTED' ? 'COMPLETED' : 'FAILED',
        passed: executionResult.passed,
        totalTests: executionResult.totalTests,
        runtime: executionResult.runtime,
        memoryUsed: executionResult.memoryUsed,
        errors: executionResult.errors,
      };

      this.results.set(submission.id, summary);
      this.updateStatus(submission.id, summary.status);
    }
  }

  getStatus(submissionId: string): SubmissionStatus | undefined {
    return this.submissions.get(submissionId)?.status;
  }

  getResult(submissionId: string): SubmissionResultSummary | undefined {
    return this.results.get(submissionId);
  }

  private updateStatus(submissionId: string, status: SubmissionStatus): void {
    const existing = this.submissions.get(submissionId);
    if (!existing) return;
    this.submissions.set(submissionId, { ...existing, status });
  }
}

