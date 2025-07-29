import { Candidate } from '../../../src/domain/models/Candidate';

describe('Candidate Model', () => {
  it('should create a Candidate instance with required fields', () => {
    const candidate = new Candidate({
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@email.com',
    });
    expect(candidate).toBeInstanceOf(Candidate);
    expect(candidate.firstName).toBe('Juan');
    expect(candidate.lastName).toBe('Pérez');
    expect(candidate.email).toBe('juan@email.com');
  });

  it('should allow setting and getting optional fields', () => {
    const candidate = new Candidate({
      firstName: 'Ana',
      lastName: 'Gómez',
      email: 'ana@email.com',
      phone: '123456789',
      address: 'Calle Falsa 123'
    });
    expect(candidate.phone).toBe('123456789');
    expect(candidate.address).toBe('Calle Falsa 123');
  });

  it('should handle empty education and workExperience arrays', () => {
    const candidate = new Candidate({
      firstName: 'Luis',
      lastName: 'Martínez',
      email: 'luis@email.com',
      education: [],
      workExperience: []
    });
    expect(candidate.education).toEqual([]);
    expect(candidate.workExperience).toEqual([]);
  });

  it('should allow adding education and workExperience', () => {
    const candidate = new Candidate({
      firstName: 'Sara',
      lastName: 'López',
      email: 'sara@email.com',
    });
    candidate.education = [{ institution: 'UC3M', title: 'CS', startDate: new Date(), endDate: new Date(), save: jest.fn() }];
    candidate.workExperience = [{ company: 'Acme', position: 'Dev', startDate: new Date(), endDate: new Date(), save: jest.fn() }];
    expect(candidate.education.length).toBe(1);
    expect(candidate.workExperience.length).toBe(1);
  });
}); 