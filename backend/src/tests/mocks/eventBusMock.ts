import { EventType, DomainEvent } from '../../services/eventBus';

// Mock EventBus for testing
export const mockEventBus = {
  publish: jest.fn().mockResolvedValue(undefined),
  subscribe: jest.fn(),
  getQueueStats: jest.fn().mockResolvedValue({}),
  shutdown: jest.fn().mockResolvedValue(undefined),
  healthCheck: jest.fn().mockResolvedValue(true),
  on: jest.fn(),
  emit: jest.fn()
};

// Mock EventFactory
export const mockEventFactory = {
  createEvent: jest.fn().mockImplementation((type: EventType, data: any) => ({
    id: 'mock-event-id',
    type,
    timestamp: new Date(),
    version: '1.0',
    data,
    metadata: {}
  }))
};

// Mock the entire eventBus module
jest.mock('../../services/eventBus', () => ({
  EventType: {
    CANDIDATE_CREATED: 'candidate_created',
    CANDIDATE_UPDATED: 'candidate_updated',
    CANDIDATE_STAGE_CHANGED: 'candidate_stage_changed',
    INTERVIEW_SCHEDULED: 'interview_scheduled',
    INTERVIEW_COMPLETED: 'interview_completed',
    APPLICATION_SUBMITTED: 'application_submitted',
    POSITION_CREATED: 'position_created',
    POSITION_UPDATED: 'position_updated',
    USER_LOGGED_IN: 'user_logged_in',
    SECURITY_EVENT: 'security_event',
    PERFORMANCE_ALERT: 'performance_alert'
  },
  eventBus: mockEventBus,
  EventFactory: mockEventFactory
}));
