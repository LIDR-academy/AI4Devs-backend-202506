# LTI - Good Practices Implementation Guide

## Overview
This document outlines the implementation of good software engineering practices in the LTI Talent Tracking System, focusing on Domain-Driven Design (DDD), SOLID principles, DRY principle, and design patterns.

## 🏗️ Domain-Driven Design (DDD)

### Domain Layer Structure
```
src/domain/
├── models/           # Domain entities and value objects
├── events/          # Domain events
├── policies/        # Domain policies and business rules
├── repositories/    # Repository interfaces
└── specifications/  # Domain specifications
```

### Key DDD Concepts Implemented

#### 1. Domain Entities
- **Rich Domain Models**: Entities contain business logic, not just data
- **Encapsulation**: Internal state is protected, behavior is exposed through methods
- **Identity**: Each entity has a unique identifier

```typescript
// Example: Candidate entity with business logic
export class Candidate {
  private _id: number;
  private _firstName: string;
  private _lastName: string;
  private _email: string;
  
  constructor(data: CandidateData) {
    this.validateEmail(data.email);
    this._firstName = data.firstName;
    this._lastName = data.lastName;
    this._email = data.email;
  }
  
  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }
  
  private validateEmail(email: string): void {
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
  }
}
```

#### 2. Value Objects
- Immutable objects representing concepts in the domain
- No identity, defined by their attributes

```typescript
export class Email {
  private readonly _value: string;
  
  constructor(value: string) {
    this.validate(value);
    this._value = value;
  }
  
  get value(): string {
    return this._value;
  }
  
  private validate(email: string): void {
    // Email validation logic
  }
}
```

#### 3. Domain Events
- Events that represent something that happened in the domain
- Used for decoupling and event-driven architecture

```typescript
export abstract class DomainEvent {
  public readonly occurredOn: Date;
  
  constructor() {
    this.occurredOn = new Date();
  }
}

export class CandidateCreatedEvent extends DomainEvent {
  constructor(public readonly candidateId: number) {
    super();
  }
}
```

## 🔧 SOLID Principles

### 1. Single Responsibility Principle (SRP)
Each class has one reason to change.

```typescript
// ✅ Good: Single responsibility
export class CandidateValidator {
  validate(candidate: Candidate): ValidationResult {
    // Only validation logic
  }
}

export class CandidateRepository {
  save(candidate: Candidate): Promise<Candidate> {
    // Only persistence logic
  }
}

// ❌ Bad: Multiple responsibilities
export class CandidateManager {
  validate(candidate: Candidate): void { /* ... */ }
  save(candidate: Candidate): void { /* ... */ }
  sendEmail(candidate: Candidate): void { /* ... */ }
}
```

### 2. Open/Closed Principle (OCP)
Open for extension, closed for modification.

```typescript
// ✅ Good: Open for extension
export interface InterviewStrategy {
  conduct(candidate: Candidate): Promise<InterviewResult>;
}

export class TechnicalInterview implements InterviewStrategy {
  async conduct(candidate: Candidate): Promise<InterviewResult> {
    // Technical interview logic
  }
}

export class BehavioralInterview implements InterviewStrategy {
  async conduct(candidate: Candidate): Promise<InterviewResult> {
    // Behavioral interview logic
  }
}
```

### 3. Liskov Substitution Principle (LSP)
Subtypes must be substitutable for their base types.

```typescript
// ✅ Good: LSP compliance
export abstract class InterviewStep {
  abstract execute(candidate: Candidate): Promise<StepResult>;
}

export class PhoneScreen extends InterviewStep {
  async execute(candidate: Candidate): Promise<StepResult> {
    // Phone screen logic
  }
}

export class OnsiteInterview extends InterviewStep {
  async execute(candidate: Candidate): Promise<StepResult> {
    // Onsite interview logic
  }
}
```

### 4. Interface Segregation Principle (ISP)
Clients should not be forced to depend on interfaces they don't use.

```typescript
// ✅ Good: Segregated interfaces
export interface ICandidateReader {
  findById(id: number): Promise<Candidate | null>;
  findAll(): Promise<Candidate[]>;
}

export interface ICandidateWriter {
  save(candidate: Candidate): Promise<Candidate>;
  update(candidate: Candidate): Promise<Candidate>;
}

export interface ICandidateRepository extends ICandidateReader, ICandidateWriter {
  // Combines read and write capabilities
}
```

### 5. Dependency Inversion Principle (DIP)
High-level modules should not depend on low-level modules. Both should depend on abstractions.

```typescript
// ✅ Good: Dependency inversion
export class CandidateService {
  constructor(
    private candidateRepository: ICandidateRepository,
    private eventBus: IEventBus
  ) {}
  
  async createCandidate(data: CandidateData): Promise<Candidate> {
    const candidate = new Candidate(data);
    const savedCandidate = await this.candidateRepository.save(candidate);
    await this.eventBus.publish(new CandidateCreatedEvent(savedCandidate.id));
    return savedCandidate;
  }
}
```

## 🚫 DRY Principle (Don't Repeat Yourself)

### 1. Shared Utilities
```typescript
// Common validation utilities
export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone);
  }
}
```

### 2. Base Classes
```typescript
// Base entity class
export abstract class BaseEntity {
  protected _id: number;
  protected _createdAt: Date;
  protected _updatedAt: Date;
  
  constructor(id?: number) {
    this._id = id || 0;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }
  
  get id(): number {
    return this._id;
  }
  
  get createdAt(): Date {
    return this._createdAt;
  }
  
  get updatedAt(): Date {
    return this._updatedAt;
  }
}
```

### 3. Common DTOs
```typescript
// Shared response structure
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## 🎨 Design Patterns

### 1. Repository Pattern
```typescript
export interface ICandidateRepository {
  findById(id: number): Promise<Candidate | null>;
  save(candidate: Candidate): Promise<Candidate>;
  update(candidate: Candidate): Promise<Candidate>;
  delete(id: number): Promise<void>;
  findByPosition(positionId: number): Promise<Candidate[]>;
}

export class PrismaCandidateRepository implements ICandidateRepository {
  constructor(private prisma: PrismaClient) {}
  
  async findById(id: number): Promise<Candidate | null> {
    const data = await this.prisma.candidate.findUnique({
      where: { id },
      include: { educations: true, workExperiences: true }
    });
    return data ? new Candidate(data) : null;
  }
  
  // ... other methods
}
```

### 2. Factory Pattern
```typescript
export class InterviewFactory {
  static createInterview(type: InterviewType, data: InterviewData): Interview {
    switch (type) {
      case InterviewType.TECHNICAL:
        return new TechnicalInterview(data);
      case InterviewType.BEHAVIORAL:
        return new BehavioralInterview(data);
      case InterviewType.PHONE_SCREEN:
        return new PhoneScreen(data);
      default:
        throw new Error(`Unknown interview type: ${type}`);
    }
  }
}
```

### 3. Strategy Pattern
```typescript
export interface ScoringStrategy {
  calculateScore(interview: Interview): number;
}

export class TechnicalScoringStrategy implements ScoringStrategy {
  calculateScore(interview: Interview): number {
    // Technical interview scoring logic
    return interview.technicalScore * 0.7 + interview.problemSolvingScore * 0.3;
  }
}

export class BehavioralScoringStrategy implements ScoringStrategy {
  calculateScore(interview: Interview): number {
    // Behavioral interview scoring logic
    return interview.communicationScore * 0.4 + interview.cultureFitScore * 0.6;
  }
}
```

### 4. Observer Pattern (Event-Driven)
```typescript
export interface EventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

export class CandidateCreatedHandler implements EventHandler<CandidateCreatedEvent> {
  async handle(event: CandidateCreatedEvent): Promise<void> {
    // Send welcome email, create profile, etc.
    console.log(`Candidate ${event.candidateId} created`);
  }
}

export class EventBus {
  private handlers: Map<string, EventHandler<any>[]> = new Map();
  
  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }
  
  async publish<T extends DomainEvent>(event: T): Promise<void> {
    const eventType = event.constructor.name;
    const handlers = this.handlers.get(eventType) || [];
    
    for (const handler of handlers) {
      await handler.handle(event);
    }
  }
}
```

### 5. Decorator Pattern
```typescript
export interface ICandidateService {
  createCandidate(data: CandidateData): Promise<Candidate>;
  updateCandidate(id: number, data: Partial<CandidateData>): Promise<Candidate>;
}

export class LoggingDecorator implements ICandidateService {
  constructor(private service: ICandidateService) {}
  
  async createCandidate(data: CandidateData): Promise<Candidate> {
    console.log(`Creating candidate: ${data.email}`);
    const result = await this.service.createCandidate(data);
    console.log(`Candidate created with ID: ${result.id}`);
    return result;
  }
  
  async updateCandidate(id: number, data: Partial<CandidateData>): Promise<Candidate> {
    console.log(`Updating candidate: ${id}`);
    const result = await this.service.updateCandidate(id, data);
    console.log(`Candidate updated: ${id}`);
    return result;
  }
}
```

## 📁 Project Structure Best Practices

### 1. Feature-Based Organization
```
src/
├── features/
│   ├── candidates/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── positions/
│   ├── interviews/
│   └── applications/
├── shared/
│   ├── domain/
│   ├── infrastructure/
│   └── utils/
└── main/
    ├── config/
    ├── routes/
    └── index.ts
```

### 2. Dependency Injection Container
```typescript
export class ServiceContainer {
  private services: Map<string, any> = new Map();
  
  register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory);
  }
  
  resolve<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service not found: ${key}`);
    }
    return factory();
  }
}

// Usage
const container = new ServiceContainer();
container.register('ICandidateRepository', () => new PrismaCandidateRepository(prisma));
container.register('ICandidateService', () => new CandidateService(
  container.resolve('ICandidateRepository'),
  container.resolve('IEventBus')
));
```

## 🧪 Testing Best Practices

### 1. Unit Testing
```typescript
describe('CandidateService', () => {
  let service: CandidateService;
  let mockRepository: jest.Mocked<ICandidateRepository>;
  
  beforeEach(() => {
    mockRepository = createMockRepository();
    service = new CandidateService(mockRepository);
  });
  
  it('should create a candidate successfully', async () => {
    const candidateData = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
    const expectedCandidate = new Candidate(candidateData);
    
    mockRepository.save.mockResolvedValue(expectedCandidate);
    
    const result = await service.createCandidate(candidateData);
    
    expect(result).toEqual(expectedCandidate);
    expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Candidate));
  });
});
```

### 2. Integration Testing
```typescript
describe('Candidate API Integration', () => {
  it('should create and retrieve a candidate', async () => {
    const candidateData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com'
    };
    
    const createResponse = await request(app)
      .post('/candidates')
      .send(candidateData)
      .expect(201);
    
    const candidateId = createResponse.body.data.id;
    
    const getResponse = await request(app)
      .get(`/candidates/${candidateId}`)
      .expect(200);
    
    expect(getResponse.body.firstName).toBe(candidateData.firstName);
  });
});
```

## 🔒 Security Best Practices

### 1. Input Validation
```typescript
export class CandidateValidator {
  static validate(data: any): ValidationResult {
    const errors: string[] = [];
    
    if (!data.firstName || data.firstName.length < 2) {
      errors.push('First name must be at least 2 characters long');
    }
    
    if (!data.email || !ValidationUtils.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

### 2. Error Handling
```typescript
export class ApplicationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends ApplicationError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}
```

## 📊 Performance Best Practices

### 1. Database Optimization
```typescript
// Use specific selects instead of select all
export class OptimizedCandidateRepository {
  async findCandidatesForPosition(positionId: number): Promise<CandidateSummary[]> {
    return this.prisma.candidate.findMany({
      where: {
        applications: {
          some: { positionId }
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        applications: {
          where: { positionId },
          select: {
            currentInterviewStep: true,
            interviews: {
              select: { score: true }
            }
          }
        }
      }
    });
  }
}
```

### 2. Caching Strategy
```typescript
export class CachedCandidateService {
  constructor(
    private service: ICandidateService,
    private cache: ICache
  ) {}
  
  async findById(id: number): Promise<Candidate | null> {
    const cacheKey = `candidate:${id}`;
    const cached = await this.cache.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const candidate = await this.service.findById(id);
    
    if (candidate) {
      await this.cache.set(cacheKey, JSON.stringify(candidate), 300); // 5 minutes
    }
    
    return candidate;
  }
}
```

## 🚀 Conclusion

This implementation demonstrates how to build a maintainable, scalable, and testable application using:

- **DDD** for clear domain boundaries and business logic
- **SOLID** principles for flexible and extensible code
- **DRY** principle to eliminate code duplication
- **Design patterns** for common architectural problems
- **Clean architecture** for separation of concerns
- **Comprehensive testing** for reliability
- **Security and performance** best practices

These practices ensure the codebase remains clean, maintainable, and ready for future enhancements.
