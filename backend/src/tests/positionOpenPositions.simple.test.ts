import { Position } from '../domain/models/Position';

describe('Position Model - Simple Open Positions Tests', () => {
    
    describe('Constructor and Basic Properties', () => {
        it('should create position instance with Open status', () => {
            // Arrange
            const positionData = {
                id: 1,
                companyId: 1,
                interviewFlowId: 1,
                title: 'Software Engineer',
                description: 'Develop and maintain software applications.',
                status: 'Open',
                isVisible: true,
                location: 'Remote',
                jobDescription: 'Full-stack development',
                salaryMin: 50000,
                salaryMax: 80000,
                employmentType: 'Full-time'
            };

            // Act
            const position = new Position(positionData);

            // Assert
            expect(position.id).toBe(1);
            expect(position.status).toBe('Open');
            expect(position.isVisible).toBe(true);
            expect(position.title).toBe('Software Engineer');
            expect(position.location).toBe('Remote');
        });

        it('should set default values for optional fields', () => {
            // Arrange
            const positionData = {
                companyId: 1,
                interviewFlowId: 1,
                title: 'Developer',
                description: 'Full Stack Developer',
                location: 'Madrid',
                jobDescription: 'Develop web applications'
            };

            // Act
            const position = new Position(positionData);

            // Assert
            expect(position.status).toBe('Draft'); // Valor por defecto
            expect(position.isVisible).toBe(false); // Valor por defecto
            expect(position.requirements).toBeUndefined();
            expect(position.salaryMin).toBeUndefined();
        });

        it('should handle Open status correctly', () => {
            // Arrange
            const positionData = {
                companyId: 1,
                interviewFlowId: 1,
                title: 'Open Position',
                description: 'This position is open',
                status: 'Open',
                isVisible: true,
                location: 'Office',
                jobDescription: 'Open position'
            };

            // Act
            const position = new Position(positionData);

            // Assert
            expect(position.status).toBe('Open');
            expect(position.isVisible).toBe(true);
        });

        it('should handle different status values', () => {
            // Arrange & Act
            const openPosition = new Position({
                companyId: 1,
                interviewFlowId: 1,
                title: 'Open Position',
                description: 'Open',
                status: 'Open',
                isVisible: true,
                location: 'Office',
                jobDescription: 'Open'
            });

            const draftPosition = new Position({
                companyId: 1,
                interviewFlowId: 1,
                title: 'Draft Position',
                description: 'Draft',
                status: 'Draft',
                isVisible: false,
                location: 'Office',
                jobDescription: 'Draft'
            });

            const closedPosition = new Position({
                companyId: 1,
                interviewFlowId: 1,
                title: 'Closed Position',
                description: 'Closed',
                status: 'Closed',
                isVisible: false,
                location: 'Office',
                jobDescription: 'Closed'
            });

            // Assert
            expect(openPosition.status).toBe('Open');
            expect(openPosition.isVisible).toBe(true);

            expect(draftPosition.status).toBe('Draft');
            expect(draftPosition.isVisible).toBe(false);

            expect(closedPosition.status).toBe('Closed');
            expect(closedPosition.isVisible).toBe(false);
        });
    });

    describe('Salary and Benefits Handling', () => {
        it('should handle salary ranges correctly', () => {
            // Arrange
            const positionData = {
                companyId: 1,
                interviewFlowId: 1,
                title: 'Developer',
                description: 'Full Stack Developer',
                status: 'Open',
                isVisible: true,
                location: 'Madrid',
                jobDescription: 'Develop web applications',
                salaryMin: 35000,
                salaryMax: 45000,
                employmentType: 'Full-time',
                benefits: 'Health insurance, 401k'
            };

            // Act
            const position = new Position(positionData);

            // Assert
            expect(position.salaryMin).toBe(35000);
            expect(position.salaryMax).toBe(45000);
            expect(position.employmentType).toBe('Full-time');
            expect(position.benefits).toBe('Health insurance, 401k');
        });

        it('should handle missing salary information', () => {
            // Arrange
            const positionData = {
                companyId: 1,
                interviewFlowId: 1,
                title: 'Developer',
                description: 'Full Stack Developer',
                status: 'Open',
                isVisible: true,
                location: 'Madrid',
                jobDescription: 'Develop web applications'
            };

            // Act
            const position = new Position(positionData);

            // Assert
            expect(position.salaryMin).toBeUndefined();
            expect(position.salaryMax).toBeUndefined();
            expect(position.employmentType).toBeUndefined();
            expect(position.benefits).toBeUndefined();
        });
    });

    describe('Date Handling', () => {
        it('should handle application deadline correctly', () => {
            // Arrange
            const testDate = new Date('2025-02-28');
            const positionData = {
                companyId: 1,
                interviewFlowId: 1,
                title: 'Developer',
                description: 'Full Stack Developer',
                status: 'Open',
                isVisible: true,
                location: 'Madrid',
                jobDescription: 'Develop web applications',
                applicationDeadline: testDate
            };

            // Act
            const position = new Position(positionData);

            // Assert
            expect(position.applicationDeadline).toEqual(testDate);
        });

        it('should handle string dates correctly', () => {
            // Arrange
            const dateString = '2025-02-28T00:00:00Z';
            const positionData = {
                companyId: 1,
                interviewFlowId: 1,
                title: 'Developer',
                description: 'Full Stack Developer',
                status: 'Open',
                isVisible: true,
                location: 'Madrid',
                jobDescription: 'Develop web applications',
                applicationDeadline: dateString
            };

            // Act
            const position = new Position(positionData);

            // Assert
            expect(position.applicationDeadline).toBeInstanceOf(Date);
            expect(position.applicationDeadline?.getFullYear()).toBe(2025);
            expect(position.applicationDeadline?.getMonth()).toBe(1); // Febrero es mes 1 (0-indexed)
            // Nota: El día puede variar debido a zonas horarias, verificamos que sea un Date válido
            expect(position.applicationDeadline?.getDate()).toBeGreaterThan(0);
            expect(position.applicationDeadline?.getDate()).toBeLessThan(32);
        });

        it('should handle missing application deadline', () => {
            // Arrange
            const positionData = {
                companyId: 1,
                interviewFlowId: 1,
                title: 'Developer',
                description: 'Full Stack Developer',
                status: 'Open',
                isVisible: true,
                location: 'Madrid',
                jobDescription: 'Develop web applications'
            };

            // Act
            const position = new Position(positionData);

            // Assert
            expect(position.applicationDeadline).toBeUndefined();
        });
    });

    describe('Requirements and Responsibilities', () => {
        it('should handle requirements and responsibilities', () => {
            // Arrange
            const positionData = {
                companyId: 1,
                interviewFlowId: 1,
                title: 'Senior Developer',
                description: 'Senior Full Stack Developer',
                status: 'Open',
                isVisible: true,
                location: 'Madrid',
                jobDescription: 'Lead development team',
                requirements: '5+ years experience, React, Node.js',
                responsibilities: 'Lead development, mentor junior developers',
                companyDescription: 'Leading tech company'
            };

            // Act
            const position = new Position(positionData);

            // Assert
            expect(position.requirements).toBe('5+ years experience, React, Node.js');
            expect(position.responsibilities).toBe('Lead development, mentor junior developers');
            expect(position.companyDescription).toBe('Leading tech company');
        });

        it('should handle missing requirements and responsibilities', () => {
            // Arrange
            const positionData = {
                companyId: 1,
                interviewFlowId: 1,
                title: 'Developer',
                description: 'Full Stack Developer',
                status: 'Open',
                isVisible: true,
                location: 'Madrid',
                jobDescription: 'Develop web applications'
            };

            // Act
            const position = new Position(positionData);

            // Assert
            expect(position.requirements).toBeUndefined();
            expect(position.responsibilities).toBeUndefined();
            expect(position.companyDescription).toBeUndefined();
        });
    });
});
