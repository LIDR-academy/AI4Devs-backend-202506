import { Education } from '../../../src/domain/models/Education';

describe('Education Model', () => {
  it('should create an Education instance with required fields', () => {
    const education = new Education({
      institution: 'UC3M',
      title: 'Computer Science',
      startDate: new Date('2010-01-01'),
      endDate: new Date('2014-01-01'),
      candidateId: 1
    });
    expect(education).toBeInstanceOf(Education);
    expect(education.institution).toBe('UC3M');
    expect(education.title).toBe('Computer Science');
    expect(education.startDate).toEqual(new Date('2010-01-01'));
    expect(education.endDate).toEqual(new Date('2014-01-01'));
    expect(education.candidateId).toBe(1);
  });

  it('should allow updating endDate', () => {
    const education = new Education({
      institution: 'UC3M',
      title: 'CS',
      startDate: new Date('2010-01-01'),
      candidateId: 1
    });
    education.endDate = new Date('2012-01-01');
    expect(education.endDate).toEqual(new Date('2012-01-01'));
  });
}); 