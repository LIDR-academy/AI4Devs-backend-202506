import { WorkExperience } from '../../../src/domain/models/WorkExperience';

describe('WorkExperience Model', () => {
  it('should create a WorkExperience instance with required fields', () => {
    const work = new WorkExperience({
      company: 'Acme',
      position: 'Developer',
      startDate: new Date('2015-01-01'),
      endDate: new Date('2018-01-01'),
      candidateId: 2
    });
    expect(work).toBeInstanceOf(WorkExperience);
    expect(work.company).toBe('Acme');
    expect(work.position).toBe('Developer');
    expect(work.startDate).toEqual(new Date('2015-01-01'));
    expect(work.endDate).toEqual(new Date('2018-01-01'));
    expect(work.candidateId).toBe(2);
  });

  it('should allow updating description', () => {
    const work = new WorkExperience({
      company: 'Acme',
      position: 'Dev',
      startDate: new Date('2015-01-01'),
      candidateId: 2
    });
    work.description = 'Backend developer';
    expect(work.description).toBe('Backend developer');
  });
}); 