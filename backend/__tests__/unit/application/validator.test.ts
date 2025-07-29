import { validateCandidateData } from '../../../src/application/validator';

describe('validateCandidateData', () => {
  it('should accept valid candidate data', () => {
    expect(() => validateCandidateData({
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan@email.com',
      phone: '612345678',
      address: 'Calle Falsa 123',
      educations: [{ institution: 'UC3M', title: 'CS', startDate: '2022-01-01' }],
      workExperiences: [{ company: 'Acme', position: 'Dev', startDate: '2022-01-01' }],
      cv: { filePath: 'uploads/cv.pdf', fileType: 'application/pdf' }
    })).not.toThrow();
  });

  it('should skip validation if id is present', () => {
    expect(() => validateCandidateData({ id: 1 })).not.toThrow();
  });

  it('should reject invalid candidate data (name)', () => {
    expect(() => validateCandidateData({ firstName: 'A', lastName: 'B', email: 'test@email.com' })).toThrow();
  });

  it('should reject invalid candidate data (email)', () => {
    expect(() => validateCandidateData({ firstName: 'Juan', lastName: 'Pérez', email: 'bad' })).toThrow();
  });

  it('should reject invalid candidate data (phone)', () => {
    expect(() => validateCandidateData({ firstName: 'Juan', lastName: 'Pérez', email: 'juan@email.com', phone: '123' })).toThrow();
  });

  it('should reject invalid candidate data (address)', () => {
    expect(() => validateCandidateData({ firstName: 'Juan', lastName: 'Pérez', email: 'juan@email.com', address: 'a'.repeat(101) })).toThrow();
  });

  it('should reject invalid candidate data (education)', () => {
    expect(() => validateCandidateData({ firstName: 'Juan', lastName: 'Pérez', email: 'juan@email.com', educations: [{ institution: '', title: 'CS', startDate: '2022-01-01' }] })).toThrow();
  });

  it('should reject invalid candidate data (workExperience)', () => {
    expect(() => validateCandidateData({ firstName: 'Juan', lastName: 'Pérez', email: 'juan@email.com', workExperiences: [{ company: '', position: 'Dev', startDate: '2022-01-01' }] })).toThrow();
  });

  it('should reject invalid candidate data (cv)', () => {
    expect(() => validateCandidateData({ firstName: 'Juan', lastName: 'Pérez', email: 'juan@email.com', cv: {} })).toThrow();
  });
}); 