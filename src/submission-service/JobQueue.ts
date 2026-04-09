import { QueueJob } from './types';

/**
 * JobQueue
 *  - Simple in-memory FIFO queue to simulate a distributed job queue.
 *  - In a real deployment, this would be backed by Redis, RabbitMQ, etc.
 */
export class JobQueue {
  private readonly queue: QueueJob[] = [];

  enqueue(job: QueueJob): void {
    this.queue.push(job);
  }

  dequeue(): QueueJob | undefined {
    return this.queue.shift();
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  size(): number {
    return this.queue.length;
  }
}

