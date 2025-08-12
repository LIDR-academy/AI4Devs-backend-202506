import { Position } from '../domain/models/Position';
import { PrismaClient } from '@prisma/client';

// Mock de Prisma
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        position: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            update: jest.fn()
        }
    }))
}));

describe('Position Model', () => {
    let mockPrisma: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockPrisma = new PrismaClient();
    });

    describe('Constructor', () => {
        it('should create position instance with provided data', () => {
            // Arrange
            const positionData = {
                id: 1,
                title: 'Developer',
                companyId: 1,
                interviewFlowId: 1,
                description: 'Full Stack Developer',
                status: 'Active',
                isVisible: true,
                location: 'Madrid',
                jobDescription: 'Develop web applications'
            };

            // Act
            const position = new Position(positionData);

            // Assert
            expect(position.id).toBe(1);
            expect(position.title).toBe('Developer');
            expect(position.status).toBe('Active');
            expect(position.isVisible).toBe(true);
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
            expect(position.status).toBe('Draft');
            expect(position.isVisible).toBe(false);
        });

        it('should handle date fields correctly', () => {
            // Arrange
            const testDate = new Date('2025-01-15');
            const positionData = {
                companyId: 1,
                interviewFlowId: 1,
                title: 'Developer',
                description: 'Full Stack Developer',
                location: 'Madrid',
                jobDescription: 'Develop web applications',
                applicationDeadline: testDate
            };

            // Act
            const position = new Position(positionData);

            // Assert
            expect(position.applicationDeadline).toEqual(testDate);
        });

        it('should handle undefined date fields', () => {
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
            expect(position.applicationDeadline).toBeUndefined();
        });
    });

    describe('save() method', () => {
        it('should create new position when no ID exists', async () => {
            // Arrange
            const positionData = {
                companyId: 1,
                interviewFlowId: 1,
                title: 'Developer',
                description: 'Full Stack Developer',
                status: 'Active',
                isVisible: true,
                location: 'Madrid',
                jobDescription: 'Develop web applications'
            };

            const mockCreatedPosition = { id: 1, ...positionData };
            mockPrisma.position.create.mockResolvedValue(mockCreatedPosition);

            const position = new Position(positionData);

            // Act
            const result = await position.save();

            // Assert
            expect(mockPrisma.position.create).toHaveBeenCalledWith({
                data: positionData
            });
            expect(result).toEqual(mockCreatedPosition);
        });

        it('should update existing position when ID exists', async () => {
            // Arrange
            const positionData = {
                id: 1,
                companyId: 1,
                interviewFlowId: 1,
                title: 'Developer',
                description: 'Full Stack Developer',
                status: 'Active',
                isVisible: true,
                location: 'Madrid',
                jobDescription: 'Develop web applications'
            };

            const mockUpdatedPosition = { ...positionData, title: 'Senior Developer' };
            mockPrisma.position.update.mockResolvedValue(mockUpdatedPosition);

            const position = new Position(positionData);

            // Act
            const result = await position.save();

            // Assert
            expect(mockPrisma.position.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: positionData
            });
            expect(result).toEqual(mockUpdatedPosition);
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            const positionData = {
                companyId: 1,
                interviewFlowId: 1,
                title: 'Developer',
                description: 'Full Stack Developer',
                location: 'Madrid',
                jobDescription: 'Develop web applications'
            };

            mockPrisma.position.create.mockRejectedValue(new Error('Database connection failed'));

            const position = new Position(positionData);

            // Act & Assert
            await expect(position.save()).rejects.toThrow('Database connection failed');
        });
    });

    describe('findOne() static method', () => {
        it('should return position when found', async () => {
            // Arrange
            const mockPosition = {
                id: 1,
                title: 'Developer',
                status: 'Active'
            };

            mockPrisma.position.findUnique.mockResolvedValue(mockPosition);

            // Act
            const result = await Position.findOne(1);

            // Assert
            expect(mockPrisma.position.findUnique).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(result).toBeInstanceOf(Position);
            expect(result?.id).toBe(1);
        });

        it('should return null when position not found', async () => {
            // Arrange
            mockPrisma.position.findUnique.mockResolvedValue(null);

            // Act
            const result = await Position.findOne(999);

            // Assert
            expect(result).toBeNull();
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            mockPrisma.position.findUnique.mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(Position.findOne(1)).rejects.toThrow('Database error');
        });
    });

    describe('findActivePositions() static method', () => {
        it('should return active positions with pagination', async () => {
            // Arrange
            const mockPositions = [
                { id: 1, title: 'Developer', status: 'Active' },
                { id: 2, title: 'Designer', status: 'Active' }
            ];

            const mockCount = 2;
            mockPrisma.position.count.mockResolvedValue(mockCount);
            mockPrisma.position.findMany.mockResolvedValue(mockPositions);

            // Act
            const result = await Position.findActivePositions(1, 10);

            // Assert
            expect(mockPrisma.position.count).toHaveBeenCalledWith({
                where: {
                    status: 'Active',
                    isVisible: true
                }
            });

            expect(mockPrisma.position.findMany).toHaveBeenCalledWith({
                where: {
                    status: 'Active',
                    isVisible: true
                },
                include: {
                    company: {
                        select: {
                            name: true
                        }
                    }
                },
                skip: 0,
                take: 10,
                orderBy: {
                    id: 'desc'
                }
            });

            expect(result.positions).toHaveLength(2);
            expect(result.pagination).toEqual({
                page: 1,
                limit: 10,
                total: 2,
                totalPages: 1
            });
        });

        it('should calculate pagination correctly', async () => {
            // Arrange
            const mockCount = 25;
            mockPrisma.position.count.mockResolvedValue(mockCount);
            mockPrisma.position.findMany.mockResolvedValue([]);

            // Act
            const result = await Position.findActivePositions(2, 10);

            // Assert
            expect(result.pagination).toEqual({
                page: 2,
                limit: 10,
                total: 25,
                totalPages: 3
            });
        });

        it('should handle empty results', async () => {
            // Arrange
            mockPrisma.position.count.mockResolvedValue(0);
            mockPrisma.position.findMany.mockResolvedValue([]);

            // Act
            const result = await Position.findActivePositions(1, 10);

            // Assert
            expect(result.positions).toHaveLength(0);
            expect(result.pagination.total).toBe(0);
            expect(result.pagination.totalPages).toBe(0);
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            mockPrisma.position.count.mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(Position.findActivePositions(1, 10)).rejects.toThrow('Database error');
        });
    });
});
