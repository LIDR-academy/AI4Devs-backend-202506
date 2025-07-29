import { InterviewFlow } from '../../../src/domain/models/InterviewFlow';

describe('InterviewFlow Model', () => {
  it('should create an InterviewFlow instance with required fields', () => {
    const flow = new InterviewFlow({
      description: 'Flujo estándar'
    });
    expect(flow).toBeInstanceOf(InterviewFlow);
    expect(flow.description).toBe('Flujo estándar');
  });

  it('should allow setting id', () => {
    const flow = new InterviewFlow({ description: 'Flujo', id: 7 });
    expect(flow.id).toBe(7);
  });
}); 