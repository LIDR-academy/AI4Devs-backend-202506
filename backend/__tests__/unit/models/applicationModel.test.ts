import { Application } from '../../../src/domain/models/Application';

describe('Application Model', () => {
  it('should create an Application instance with required fields', () => {
    const application = new Application({
      positionId: 1,
      candidateId: 2,
      applicationDate: new Date('2023-01-01'),
      currentInterviewStep: 1
    });
    expect(application).toBeInstanceOf(Application);
    expect(application.positionId).toBe(1);
    expect(application.candidateId).toBe(2);
    expect(application.applicationDate).toEqual(new Date('2023-01-01'));
    expect(application.currentInterviewStep).toBe(1);
  });

  it('should allow setting notes and interviews', () => {
    const application = new Application({
      positionId: 1,
      candidateId: 2,
      applicationDate: new Date(),
      currentInterviewStep: 1
    });
    application.notes = 'Candidato recomendado';
    application.interviews = [];
    expect(application.notes).toBe('Candidato recomendado');
    expect(application.interviews).toEqual([]);
  });
}); 