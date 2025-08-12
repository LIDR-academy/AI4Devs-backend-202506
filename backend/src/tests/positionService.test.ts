import { 
    getActivePositions, 
    getPositionById, 
    getPositionsWithFilters,
    formatSalary,
    formatDate,
    getPositionStatusInfo 
} from '../application/services/positionService';
import { Position } from '../../domain/models/Position';

// Mock del modelo Position
jest.mock('../../domain/models/Position');

describe('PositionService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getActivePositions', () => {
        it('should return active positions with pagination', async () => {
            // Arrange
            const mockPositions = [
                { id: 1, title: 'Developer', status: 'Active' },
                { id: 2, title: 'Designer', status: 'Active' }
            ];
            const mockPagination = {
                page: 1,
                limit: 10,
                total: 2,
                totalPages: 1
            };

            (Position.findActivePositions as jest.Mock).mockResolvedValue({
                positions: mockPositions,
                pagination: mockPagination
            });

            // Act
            const result = await getActivePositions(1, 10);

            // Assert
            expect(result).toEqual({
                positions: mockPositions,
                pagination: mockPagination
            });
            expect(Position.findActivePositions).toHaveBeenCalledWith(1, 10);
        });

        it('should validate and normalize page parameter', async () => {
            // Arrange
            const mockResult = {
                positions: [],
                pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
            };

            (Position.findActivePositions as jest.Mock).mockResolvedValue(mockResult);

            // Act
            await getActivePositions(0, 10); // page 0 should become 1

            // Assert
            expect(Position.findActivePositions).toHaveBeenCalledWith(1, 10);
        });

        it('should validate and normalize limit parameter', async () => {
            // Arrange
            const mockResult = {
                positions: [],
                pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }
            };

            (Position.findActivePositions as jest.Mock).mockResolvedValue(mockResult);

            // Act
            await getActivePositions(1, 100); // limit 100 should become 50

            // Assert
            expect(Position.findActivePositions).toHaveBeenCalledWith(1, 50);
        });

        it('should handle errors gracefully', async () => {
            // Arrange
            const errorMessage = 'Database connection failed';
            (Position.findActivePositions as jest.Mock).mockRejectedValue(new Error(errorMessage));

            // Act & Assert
            await expect(getActivePositions(1, 10)).rejects.toThrow('No se pudieron obtener las posiciones activas');
        });
    });

    describe('getPositionById', () => {
        it('should return position when valid ID is provided', async () => {
            // Arrange
            const mockPosition = { id: 1, title: 'Developer' };
            (Position.findOne as jest.Mock).mockResolvedValue(mockPosition);

            // Act
            const result = await getPositionById(1);

            // Assert
            expect(result).toEqual(mockPosition);
            expect(Position.findOne).toHaveBeenCalledWith(1);
        });

        it('should throw error for invalid ID', async () => {
            // Act & Assert
            await expect(getPositionById(0)).rejects.toThrow('ID de posición inválido');
            await expect(getPositionById(NaN)).rejects.toThrow('ID de posición inválido');
            await expect(getPositionById(-1)).rejects.toThrow('ID de posición inválido');
        });

        it('should handle database errors gracefully', async () => {
            // Arrange
            (Position.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

            // Act & Assert
            await expect(getPositionById(1)).rejects.toThrow('No se pudo obtener la posición');
        });
    });

    describe('getPositionsWithFilters', () => {
        it('should redirect to getActivePositions for now', async () => {
            // Arrange
            const mockResult = {
                positions: [],
                pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
            };

            (Position.findActivePositions as jest.Mock).mockResolvedValue(mockResult);

            // Act
            const result = await getPositionsWithFilters({}, { page: 1, limit: 10 });

            // Assert
            expect(result).toEqual(mockResult);
            expect(Position.findActivePositions).toHaveBeenCalledWith(1, 10);
        });

        it('should handle errors gracefully', async () => {
            // Arrange
            (Position.findActivePositions as jest.Mock).mockRejectedValue(new Error('Filter error'));

            // Act & Assert
            await expect(getPositionsWithFilters({}, { page: 1, limit: 10 }))
                .rejects.toThrow('No se pudieron obtener las posiciones con filtros');
        });
    });
});

describe('PositionService Utility Functions', () => {
    describe('formatSalary', () => {
        it('should format salary correctly', () => {
            expect(formatSalary(35000)).toBe('35.000,00 €');
            expect(formatSalary(0)).toBe('0,00 €');
        });

        it('should handle undefined salary', () => {
            expect(formatSalary(undefined)).toBe('No especificado');
            expect(formatSalary(null)).toBe('No especificado');
        });
    });

    describe('formatDate', () => {
        it('should format date correctly', () => {
            const testDate = new Date('2025-01-15');
            const result = formatDate(testDate);
            expect(result).toContain('15');
            expect(result).toContain('enero');
            expect(result).toContain('2025');
        });

        it('should handle undefined date', () => {
            expect(formatDate(undefined)).toBe('No especificada');
            expect(formatDate(null)).toBe('No especificada');
        });
    });

    describe('getPositionStatusInfo', () => {
        it('should return correct status info for Active', () => {
            const result = getPositionStatusInfo('Active');
            expect(result.text).toBe('Activa');
            expect(result.className).toBe('badge bg-success');
            expect(result.color).toBe('success');
        });

        it('should return correct status info for Draft', () => {
            const result = getPositionStatusInfo('Draft');
            expect(result.text).toBe('Borrador');
            expect(result.className).toBe('badge bg-secondary');
            expect(result.color).toBe('secondary');
        });

        it('should return correct status info for Closed', () => {
            const result = getPositionStatusInfo('Closed');
            expect(result.text).toBe('Cerrada');
            expect(result.className).toBe('badge bg-danger');
            expect(result.color).toBe('danger');
        });

        it('should return correct status info for On Hold', () => {
            const result = getPositionStatusInfo('On Hold');
            expect(result.text).toBe('En Pausa');
            expect(result.className).toBe('badge bg-warning');
            expect(result.color).toBe('warning');
        });

        it('should return default status info for unknown status', () => {
            const result = getPositionStatusInfo('Unknown');
            expect(result.text).toBe('Unknown');
            expect(result.className).toBe('badge bg-info');
            expect(result.color).toBe('info');
        });

        it('should handle undefined status', () => {
            const result = getPositionStatusInfo(undefined);
            expect(result.text).toBe('Desconocido');
            expect(result.className).toBe('badge bg-info');
            expect(result.color).toBe('info');
        });
    });
});
