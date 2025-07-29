import { InterviewType } from '../../../src/domain/models/InterviewType';

describe('InterviewType Model', () => {
  it('should create an InterviewType instance with required fields', () => {
    const type = new InterviewType({
      name: 'Técnica'
    });
    expect(type).toBeInstanceOf(InterviewType);
    expect(type.name).toBe('Técnica');
  });

  it('should allow setting description and id', () => {
    const type = new InterviewType({ name: 'HR', description: 'Entrevista de recursos humanos', id: 5 });
    expect(type.description).toBe('Entrevista de recursos humanos');
    expect(type.id).toBe(5);
  });
}); 