import { Interview } from '../../../src/domain/models/Interview';

describe('Interview Model', () => {
  it('should create an Interview instance with required fields', () => {
    const interview = new Interview({
      applicationId: 1,
      interviewStepId: 2,
      employeeId: 3,
      interviewDate: new Date('2023-01-01')
    });
    expect(interview).toBeInstanceOf(Interview);
    expect(interview.applicationId).toBe(1);
    expect(interview.interviewStepId).toBe(2);
    expect(interview.employeeId).toBe(3);
    expect(interview.interviewDate).toEqual(new Date('2023-01-01'));
  });

  it('should allow setting result, score and notes', () => {
    const interview = new Interview({
      applicationId: 1,
      interviewStepId: 2,
      employeeId: 3,
      interviewDate: new Date()
    });
    interview.result = 'Aprobado';
    interview.score = 9;
    interview.notes = 'Buen desempeño';
    expect(interview.result).toBe('Aprobado');
    expect(interview.score).toBe(9);
    expect(interview.notes).toBe('Buen desempeño');
  });
}); 