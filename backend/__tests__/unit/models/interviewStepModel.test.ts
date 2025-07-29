import { InterviewStep } from '../../../src/domain/models/InterviewStep';

describe('InterviewStep Model', () => {
  it('should create an InterviewStep instance with required fields', () => {
    const step = new InterviewStep({
      interviewFlowId: 1,
      interviewTypeId: 2,
      name: 'Técnica',
      orderIndex: 1
    });
    expect(step).toBeInstanceOf(InterviewStep);
    expect(step.interviewFlowId).toBe(1);
    expect(step.interviewTypeId).toBe(2);
    expect(step.name).toBe('Técnica');
    expect(step.orderIndex).toBe(1);
  });

  it('should allow setting id', () => {
    const step = new InterviewStep({
      interviewFlowId: 1,
      interviewTypeId: 2,
      name: 'HR',
      orderIndex: 2,
      id: 99
    });
    expect(step.id).toBe(99);
  });
}); 