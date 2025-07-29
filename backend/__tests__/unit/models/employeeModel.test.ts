import { Employee } from '../../../src/domain/models/Employee';

describe('Employee Model', () => {
  it('should create an Employee instance with required fields', () => {
    const employee = new Employee({
      name: 'John Doe',
      email: 'john@email.com',
      role: 'Recruiter',
      companyId: 1
    });
    expect(employee).toBeInstanceOf(Employee);
    expect(employee.name).toBe('John Doe');
    expect(employee.email).toBe('john@email.com');
    expect(employee.role).toBe('Recruiter');
    expect(employee.companyId).toBe(1);
    expect(employee.isActive).toBe(true);
  });

  it('should allow setting isActive', () => {
    const employee = new Employee({
      name: 'Jane',
      email: 'jane@email.com',
      role: 'HR',
      companyId: 2,
      isActive: false
    });
    expect(employee.isActive).toBe(false);
  });
}); 