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

describe('Position Model - Open Positions Tests', () => {
    let mockPrisma: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockPrisma = new PrismaClient();
    });

    describe('findActivePositions - Status Open', () => {
        it('should return positions with status Open and isVisible true', async () => {
            // Arrange
            const mockPositionsData = [
                {
                    id: 1,
                    title: 'Software Engineer',
                    description: 'Develop and maintain software applications.',
                    status: 'Open',
                    isVisible: true,
                    location: 'Remote',
                    jobDescription: 'Full-stack development',
                    companyId: 1,
                    interviewFlowId: 1,
                    salaryMin: 50000,
                    salaryMax: 80000,
                    employmentType: 'Full-time',
                    company: {
                        name: 'LTI'
                    }
                },
                {
                    id: 2,
                    title: 'Data Scientist',
                    description: 'Analyze and interpret complex data.',
                    status: 'Open',
                    isVisible: true,
                    location: 'Remote',
                    jobDescription: 'Data analysis and machine learning',
                    companyId: 1,
                    interviewFlowId: 2,
                    salaryMin: 60000,
                    salaryMax: 90000,
                    employmentType: 'Full-time',
                    company: {
                        name: 'LTI'
                    }
                }
            ];

            const mockCount = 2;

            // Mock del count para posiciones con status 'Open' e isVisible true
            mockPrisma.position.count.mockResolvedValue(mockCount);

            // Mock del findMany para posiciones con status 'Open' e isVisible true
            mockPrisma.position.findMany.mockResolvedValue(mockPositionsData);

            // Act
            const result = await Position.findActivePositions(1, 10);

            // Assert
            expect(mockPrisma.position.count).toHaveBeenCalledWith({
                where: {
                    status: 'Open',
                    isVisible: true
                }
            });

            expect(mockPrisma.position.findMany).toHaveBeenCalledWith({
                where: {
                    status: 'Open',
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
            expect(result.positions[0].status).toBe('Open');
            expect(result.positions[0].isVisible).toBe(true);
            expect(result.positions[1].status).toBe('Open');
            expect(result.positions[1].isVisible).toBe(true);
            expect(result.pagination.total).toBe(2);
            expect(result.pagination.totalPages).toBe(1);
        });

        it('should not return positions with status Draft', async () => {
            // Arrange
            const mockPositionsData = [
                {
                    id: 3,
                    title: 'Draft Position',
                    description: 'This is a draft position.',
                    status: 'Draft',
                    isVisible: true,
                    location: 'Office',
                    jobDescription: 'Draft position',
                    companyId: 1,
                    interviewFlowId: 1,
                    company: {
                        name: 'LTI'
                    }
                }
            ];

            const mockCount = 1;

            mockPrisma.position.count.mockResolvedValue(mockCount);
            mockPrisma.position.findMany.mockResolvedValue(mockPositionsData);

            // Act
            const result = await Position.findActivePositions(1, 10);

            // Assert
            // Verificar que solo se busquen posiciones con status 'Open'
            expect(mockPrisma.position.count).toHaveBeenCalledWith({
                where: {
                    status: 'Open',
                    isVisible: true
                }
            });

            expect(mockPrisma.position.findMany).toHaveBeenCalledWith({
                where: {
                    status: 'Open',
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
        });

        it('should not return positions with isVisible false', async () => {
            // Arrange
            const mockPositionsData = [
                {
                    id: 4,
                    title: 'Hidden Position',
                    description: 'This position is hidden.',
                    status: 'Open',
                    isVisible: false, // Esta posición no debería aparecer
                    location: 'Office',
                    jobDescription: 'Hidden position',
                    companyId: 1,
                    interviewFlowId: 1,
                    company: {
                        name: 'LTI'
                    }
                }
            ];

            const mockCount = 0; // No debería contar posiciones ocultas

            mockPrisma.position.count.mockResolvedValue(mockCount);
            mockPrisma.position.findMany.mockResolvedValue([]);

            // Act
            const result = await Position.findActivePositions(1, 10);

            // Assert
            expect(mockPrisma.position.count).toHaveBeenCalledWith({
                where: {
                    status: 'Open',
                    isVisible: true
                }
            });

            expect(result.positions).toHaveLength(0);
            expect(result.pagination.total).toBe(0);
        });

        it('should handle empty results when no open positions exist', async () => {
            // Arrange
            mockPrisma.position.count.mockResolvedValue(0);
            mockPrisma.position.findMany.mockResolvedValue([]);

            // Act
            const result = await Position.findActivePositions(1, 10);

            // Assert
            expect(result.positions).toHaveLength(0);
            expect(result.pagination.total).toBe(0);
            expect(result.pagination.totalPages).toBe(0);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(10);
        });

        it('should include company information in the response', async () => {
            // Arrange
            const mockPositionsData = [
                {
                    id: 1,
                    title: 'Software Engineer',
                    status: 'Open',
                    isVisible: true,
                    companyId: 1,
                    interviewFlowId: 1,
                    company: {
                        name: 'LTI'
                    }
                }
            ];

            const mockCount = 1;

            mockPrisma.position.count.mockResolvedValue(mockCount);
            mockPrisma.position.findMany.mockResolvedValue(mockPositionsData);

            // Act
            const result = await Position.findActivePositions(1, 10);

            // Assert
            expect(mockPrisma.position.findMany).toHaveBeenCalledWith({
                where: {
                    status: 'Open',
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

            // Verificar que la posición tenga companyId
            expect(result.positions[0].companyId).toBe(1);
            
            // Verificar que los datos de Prisma incluyan la información de la empresa
            // Nota: El modelo Position no tiene la propiedad company, solo companyId
            // La información de company viene de Prisma pero no se mapea al modelo
        });

        it('should apply pagination correctly for open positions', async () => {
            // Arrange
            const mockCount = 25; // 25 posiciones abiertas
            mockPrisma.position.count.mockResolvedValue(mockCount);
            mockPrisma.position.findMany.mockResolvedValue([]);

            // Act
            const result = await Position.findActivePositions(2, 10); // Página 2, 10 por página

            // Assert
            expect(mockPrisma.position.findMany).toHaveBeenCalledWith({
                where: {
                    status: 'Open',
                    isVisible: true
                },
                include: {
                    company: {
                        select: {
                            name: true
                        }
                    }
                },
                skip: 10, // (2-1) * 10 = 10
                take: 10,
                orderBy: {
                    id: 'desc'
                }
            });

            expect(result.pagination.page).toBe(2);
            expect(result.pagination.limit).toBe(10);
            expect(result.pagination.total).toBe(25);
            expect(result.pagination.totalPages).toBe(3); // Math.ceil(25/10) = 3
        });

        it('should order positions by ID in descending order', async () => {
            // Arrange
            const mockCount = 2;
            mockPrisma.position.count.mockResolvedValue(mockCount);
            mockPrisma.position.findMany.mockResolvedValue([]);

            // Act
            await Position.findActivePositions(1, 10);

            // Assert
            expect(mockPrisma.position.findMany).toHaveBeenCalledWith({
                where: {
                    status: 'Open',
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
                    id: 'desc' // Verificar que se ordene por ID descendente
                }
            });
        });

        it('should correctly filter by Open status and visible positions', async () => {
            // Arrange
            const mockCount = 3;
            mockPrisma.position.count.mockResolvedValue(mockCount);
            mockPrisma.position.findMany.mockResolvedValue([]);

            // Act
            await Position.findActivePositions(1, 10);

            // Assert
            // Verificar que solo se busquen posiciones con status 'Open' e isVisible true
            expect(mockPrisma.position.count).toHaveBeenCalledWith({
                where: {
                    status: 'Open',
                    isVisible: true
                }
            });

            expect(mockPrisma.position.findMany).toHaveBeenCalledWith({
                where: {
                    status: 'Open',
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
        });
    });

    describe('Edge Cases for Open Positions', () => {
        it('should handle database errors gracefully', async () => {
            // Arrange
            mockPrisma.position.count.mockRejectedValue(new Error('Database connection failed'));

            // Act & Assert
            await expect(Position.findActivePositions(1, 10)).rejects.toThrow('Database connection failed');
        });

        it('should handle invalid pagination parameters', async () => {
            // Arrange
            const mockCount = 5;
            mockPrisma.position.count.mockResolvedValue(mockCount);
            mockPrisma.position.findMany.mockResolvedValue([]);

            // Act
            const result = await Position.findActivePositions(0, 0); // Parámetros inválidos

            // Assert
            // Los parámetros se pasan tal como están al modelo
            expect(mockPrisma.position.findMany).toHaveBeenCalledWith({
                where: {
                    status: 'Open',
                    isVisible: true
                },
                include: {
                    company: {
                        select: {
                            name: true
                        }
                    }
                },
                skip: 0, // (0-1) * 0 = 0
                take: 0, // Se pasa tal como está
                orderBy: {
                    id: 'desc'
                }
            });
        });
    });
});
