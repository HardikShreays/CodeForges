export type Language = 'python' | 'java' | 'cpp' | 'c++';

export type SubmissionStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface SubmissionRequest {
  problemId: string;
  language: Language;
  sourceCode: string;
  // Simple text-based input per test case; in a real system this could be richer.
}

export interface SubmissionRecord extends SubmissionRequest {
  id: string;
  createdAt: Date;
  status: SubmissionStatus;
}

export interface SubmissionResultSummary {
  submissionId: string;
  status: SubmissionStatus;
  passed: number;
  totalTests: number;
  runtime: number;
  memoryUsed: number;
  errors: string[];
}

export interface QueueJob {
  submission: SubmissionRecord;
}

