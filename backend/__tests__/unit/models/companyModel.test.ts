import { Company } from '../../../src/domain/models/Company';

describe('Company Model', () => {
  it('should create a Company instance with required fields', () => {
    const company = new Company({
      name: 'Acme Corp'
    });
    expect(company).toBeInstanceOf(Company);
    expect(company.name).toBe('Acme Corp');
  });

  it('should allow setting id', () => {
    const company = new Company({ name: 'Acme Corp', id: 42 });
    expect(company.id).toBe(42);
  });
}); 