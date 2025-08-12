import request from 'supertest';
import { app } from '../index';
import { 
    getActivePositions, 
    getPositionById, 
    getPositionsWithFilters 
} from '../application/services/positionService';

// Mock del servicio de posiciones
jest.mock('../application/services/positionService');

describe('PositionController Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /positions', () => {
        it('should return 200 with active positions', async () => {
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

            (getActivePositions as jest.Mock).mockResolvedValue({
                positions: mockPositions,
                pagination: mockPagination
            });

            // Act
            const response = await request(app)
                .get('/positions')
                .expect(200);

            // Assert
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Posiciones activas obtenidas exitosamente');
            expect(response.body.data).toEqual(mockPositions);
            expect(response.body.pagination).toEqual(mockPagination);
            expect(getActivePositions).toHaveBeenCalledWith(1, 10);
        });

        it('should handle pagination parameters correctly', async () => {
            // Arrange
            const mockResult = {
                positions: [],
                pagination: { page: 2, limit: 20, total: 0, totalPages: 0 }
            };

            (getActivePositions as jest.Mock).mockResolvedValue(mockResult);

            // Act
            const response = await request(app)
                .get('/positions?page=2&limit=20')
                .expect(200);

            // Assert
            expect(getActivePositions).toHaveBeenCalledWith(2, 20);
        });

        it('should return 400 for invalid pagination parameters', async () => {
            // Act & Assert
            await request(app)
                .get('/positions?page=0&limit=10')
                .expect(400);

            await request(app)
                .get('/positions?page=1&limit=0')
                .expect(400);

            await request(app)
                .get('/positions?page=1&limit=100')
                .expect(400);
        });

        it('should handle service errors gracefully', async () => {
            // Arrange
            (getActivePositions as jest.Mock).mockRejectedValue(new Error('Service error'));

            // Act
            const response = await request(app)
                .get('/positions')
                .expect(500);

            // Assert
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Error interno del servidor');
        });
    });

    describe('GET /positions/:id', () => {
        it('should return 200 with position details', async () => {
            // Arrange
            const mockPosition = { 
                id: 1, 
                title: 'Developer', 
                status: 'Active',
                location: 'Madrid'
            };

            (getPositionById as jest.Mock).mockResolvedValue(mockPosition);

            // Act
            const response = await request(app)
                .get('/positions/1')
                .expect(200);

            // Assert
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Posición obtenida exitosamente');
            expect(response.body.data).toEqual(mockPosition);
            expect(getPositionById).toHaveBeenCalledWith(1);
        });

        it('should return 400 for invalid ID format', async () => {
            // Act & Assert
            await request(app)
                .get('/positions/abc')
                .expect(400);

            await request(app)
                .get('/positions/0')
                .expect(400);

            await request(app)
                .get('/positions/-1')
                .expect(400);
        });

        it('should return 404 when position not found', async () => {
            // Arrange
            (getPositionById as jest.Mock).mockResolvedValue(null);

            // Act
            const response = await request(app)
                .get('/positions/999')
                .expect(404);

            // Assert
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Posición no encontrada');
        });

        it('should handle service errors gracefully', async () => {
            // Arrange
            (getPositionById as jest.Mock).mockRejectedValue(new Error('Service error'));

            // Act
            const response = await request(app)
                .get('/positions/1')
                .expect(500);

            // Assert
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Error interno del servidor');
        });
    });

    describe('GET /positions/filtered', () => {
        it('should return 200 with filtered positions', async () => {
            // Arrange
            const mockPositions = [
                { id: 1, title: 'Developer', location: 'Madrid' }
            ];
            const mockPagination = {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1
            };

            (getPositionsWithFilters as jest.Mock).mockResolvedValue({
                positions: mockPositions,
                pagination: mockPagination
            });

            // Act
            const response = await request(app)
                .get('/positions/filtered?location=Madrid&employmentType=Full-time')
                .expect(200);

            // Assert
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Posiciones filtradas obtenidas exitosamente');
            expect(response.body.data).toEqual(mockPositions);
            expect(response.body.filters).toEqual({
                location: 'Madrid',
                employmentType: 'Full-time'
            });
        });

        it('should handle boolean filters correctly', async () => {
            // Arrange
            const mockResult = {
                positions: [],
                pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
            };

            (getPositionsWithFilters as jest.Mock).mockResolvedValue(mockResult);

            // Act
            await request(app)
                .get('/positions/filtered?isVisible=true')
                .expect(200);

            // Assert
            expect(getPositionsWithFilters).toHaveBeenCalledWith(
                { isVisible: true },
                { page: 1, limit: 10 }
            );
        });

        it('should return 400 for invalid pagination in filtered endpoint', async () => {
            // Act & Assert
            await request(app)
                .get('/positions/filtered?page=0&limit=10')
                .expect(400);

            await request(app)
                .get('/positions/filtered?page=1&limit=100')
                .expect(400);
        });

        it('should handle service errors gracefully', async () => {
            // Arrange
            (getPositionsWithFilters as jest.Mock).mockRejectedValue(new Error('Filter error'));

            // Act
            const response = await request(app)
                .get('/positions/filtered')
                .expect(500);

            // Assert
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Error interno del servidor');
        });
    });

    describe('Error Handling', () => {
        it('should handle unknown errors gracefully', async () => {
            // Arrange
            (getActivePositions as jest.Mock).mockRejectedValue('Unknown error');

            // Act
            const response = await request(app)
                .get('/positions')
                .expect(500);

            // Assert
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Error interno del servidor');
            expect(response.body.message).toBe('Error desconocido');
        });
    });
});
