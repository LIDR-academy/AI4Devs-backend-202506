import { Position } from '../../../src/domain/models/Position';

describe('Position Model', () => {
  it('should create a Position instance with required fields', () => {
    const position = new Position({
      title: 'Backend Developer',
      companyId: 1,
      interviewFlowId: 2,
      description: 'Desarrollador Node.js',
      location: 'Madrid',
      jobDescription: 'Desarrollar APIs',
    });
    expect(position).toBeInstanceOf(Position);
    expect(position.title).toBe('Backend Developer');
    expect(position.companyId).toBe(1);
    expect(position.interviewFlowId).toBe(2);
    expect(position.description).toBe('Desarrollador Node.js');
    expect(position.location).toBe('Madrid');
    expect(position.jobDescription).toBe('Desarrollar APIs');
    expect(position.status).toBe('Draft');
    expect(position.isVisible).toBe(false);
  });

  it('should allow setting optional fields and id', () => {
    const position = new Position({
      title: 'QA',
      companyId: 2,
      interviewFlowId: 3,
      description: 'Tester',
      location: 'Barcelona',
      jobDescription: 'Testear',
      status: 'Open',
      isVisible: true,
      id: 10
    });
    expect(position.status).toBe('Open');
    expect(position.isVisible).toBe(true);
    expect(position.id).toBe(10);
  });
}); 