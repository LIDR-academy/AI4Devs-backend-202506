import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { EventEmitter } from 'events';

// Event types
export enum EventType {
  CANDIDATE_CREATED = 'candidate.created',
  CANDIDATE_UPDATED = 'candidate.updated',
  CANDIDATE_STAGE_CHANGED = 'candidate.stage.changed',
  INTERVIEW_SCHEDULED = 'interview.scheduled',
  INTERVIEW_COMPLETED = 'interview.completed',
  APPLICATION_SUBMITTED = 'application.submitted',
  POSITION_CREATED = 'position.created',
  POSITION_UPDATED = 'position.updated',
  USER_LOGGED_IN = 'user.logged_in',
  SECURITY_EVENT = 'security.event',
  PERFORMANCE_ALERT = 'performance.alert'
}

// Base event interface
export interface DomainEvent {
  id: string;
  type: EventType;
  timestamp: Date;
  version: string;
  data: any;
  metadata?: {
    userId?: number;
    companyId?: number;
    ip?: string;
    userAgent?: string;
    correlationId?: string;
  };
}

// Specific event interfaces
export interface CandidateCreatedEvent extends DomainEvent {
  type: EventType.CANDIDATE_CREATED;
  data: {
    candidateId: number;
    firstName: string;
    lastName: string;
    email: string;
    companyId: number;
  };
}

export interface CandidateStageChangedEvent extends DomainEvent {
  type: EventType.CANDIDATE_STAGE_CHANGED;
  data: {
    candidateId: number;
    positionId: number;
    oldStage: string;
    newStage: string;
    changedBy: number;
  };
}

export interface InterviewScheduledEvent extends DomainEvent {
  type: EventType.INTERVIEW_SCHEDULED;
  data: {
    interviewId: number;
    candidateId: number;
    positionId: number;
    scheduledDate: Date;
    interviewerId: number;
    interviewType: string;
  };
}

export interface SecurityEvent extends DomainEvent {
  type: EventType.SECURITY_EVENT;
  data: {
    eventType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    userId?: number;
    ip: string;
    userAgent: string;
    endpoint?: string;
  };
}

// Event handler interface
export interface EventHandler<T extends DomainEvent = DomainEvent> {
  handle(event: T): Promise<void>;
}

// Event bus implementation
export class EventBus extends EventEmitter {
  private static instance: EventBus;
  private redis: Redis;
  private queues: Map<EventType, Queue> = new Map();
  private workers: Map<EventType, Worker> = new Map();
  private handlers: Map<EventType, EventHandler[]> = new Map();

  private constructor() {
    super();
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
      lazyConnect: true
    });

    this.initializeQueues();
    this.initializeWorkers();
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  private initializeQueues(): void {
    Object.values(EventType).forEach(eventType => {
      const queue = new Queue(eventType, {
        connection: this.redis,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        }
      });
      this.queues.set(eventType, queue);
    });
  }

  private initializeWorkers(): void {
    Object.values(EventType).forEach(eventType => {
      const worker = new Worker(
        eventType,
        async (job: Job) => {
          const event = job.data as DomainEvent;
          await this.processEvent(event);
        },
        {
          connection: this.redis,
          concurrency: 5
        }
      );

      worker.on('completed', (job) => {
        console.log(`[EVENT_BUS] Event processed successfully: ${job.name}`);
      });

      worker.on('failed', (job, err) => {
        console.error(`[EVENT_BUS] Event processing failed: ${job?.name}`, err);
      });

      this.workers.set(eventType, worker);
    });
  }

  // Publish event to queue
  async publish(event: DomainEvent): Promise<void> {
    try {
      const queue = this.queues.get(event.type);
      if (!queue) {
        throw new Error(`Queue not found for event type: ${event.type}`);
      }

      await queue.add(event.type, event, {
        jobId: event.id,
        delay: 0,
        priority: this.getEventPriority(event.type)
      });

      console.log(`[EVENT_BUS] Event published: ${event.type} - ${event.id}`);
      
      // Emit local event for immediate processing
      this.emit(event.type, event);
    } catch (error) {
      console.error(`[EVENT_BUS] Failed to publish event: ${event.type}`, error);
      throw error;
    }
  }

  // Subscribe to event type
  subscribe<T extends DomainEvent>(eventType: EventType, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler as EventHandler);
    
    // Subscribe to local events
    this.on(eventType, async (event: T) => {
      try {
        await handler.handle(event);
      } catch (error) {
        console.error(`[EVENT_BUS] Handler failed for event: ${eventType}`, error);
      }
    });

    console.log(`[EVENT_BUS] Handler registered for event: ${eventType}`);
  }

  // Process event with all registered handlers
  private async processEvent(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    
    if (handlers.length === 0) {
      console.log(`[EVENT_BUS] No handlers registered for event: ${event.type}`);
      return;
    }

    const promises = handlers.map(async (handler) => {
      try {
        await handler.handle(event);
      } catch (error) {
        console.error(`[EVENT_BUS] Handler failed for event: ${event.type}`, error);
        throw error; // Re-throw to trigger job retry
      }
    });

    await Promise.all(promises);
    console.log(`[EVENT_BUS] Event processed by ${handlers.length} handlers: ${event.type}`);
  }

  // Get event priority for queue processing
  private getEventPriority(eventType: EventType): number {
    const priorities = {
      [EventType.SECURITY_EVENT]: 1, // Highest priority
      [EventType.PERFORMANCE_ALERT]: 2,
      [EventType.INTERVIEW_SCHEDULED]: 3,
      [EventType.CANDIDATE_STAGE_CHANGED]: 4,
      [EventType.CANDIDATE_CREATED]: 5,
      [EventType.CANDIDATE_UPDATED]: 5,
      [EventType.INTERVIEW_COMPLETED]: 6,
      [EventType.APPLICATION_SUBMITTED]: 7,
      [EventType.POSITION_CREATED]: 8,
      [EventType.POSITION_UPDATED]: 8,
      [EventType.USER_LOGGED_IN]: 9 // Lowest priority
    };

    return priorities[eventType] || 5;
  }

  // Get queue statistics
  async getQueueStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    for (const [eventType, queue] of Array.from(this.queues.entries())) {
      const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed()
      ]);

      stats[eventType] = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length
      };
    }

    return stats;
  }

  // Clean up resources
  async shutdown(): Promise<void> {
    console.log('[EVENT_BUS] Shutting down event bus...');
    
    // Close all workers
    for (const worker of this.workers.values()) {
      await worker.close();
    }

    // Close all queues
    for (const queue of this.queues.values()) {
      await queue.close();
    }

    // Close Redis connection
    await this.redis.quit();
    
    console.log('[EVENT_BUS] Event bus shutdown complete');
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      console.error('[EVENT_BUS] Health check failed:', error);
      return false;
    }
  }
}

// Event factory for creating events
export class EventFactory {
  static createEvent<T extends DomainEvent>(
    type: EventType,
    data: T['data'],
    metadata?: T['metadata']
  ): T {
    return {
      id: this.generateEventId(),
      type,
      timestamp: new Date(),
      version: '1.0',
      data,
      metadata
    } as T;
  }

  private static generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();
