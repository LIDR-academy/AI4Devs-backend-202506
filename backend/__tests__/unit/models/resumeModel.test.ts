import { Resume } from '../../../src/domain/models/Resume';

describe('Resume Model', () => {
  it('should create a Resume instance with required fields', () => {
    const resume = new Resume({
      filePath: 'uploads/cv.pdf',
      fileType: 'application/pdf',
      uploadDate: new Date('2022-01-01'),
      candidateId: 3
    });
    expect(resume).toBeInstanceOf(Resume);
    expect(resume.filePath).toBe('uploads/cv.pdf');
    expect(resume.fileType).toBe('application/pdf');
    expect(resume.uploadDate).toEqual(new Date('2022-01-01'));
    expect(resume.candidateId).toBe(3);
  });
}); 