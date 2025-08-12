import { Position } from '../../domain/models/Position';

/**
 * Servicio de aplicación para la gestión de posiciones
 * Implementa la lógica de negocio para operaciones con posiciones
 */

export interface PositionFilters {
    status?: string;
    isVisible?: boolean;
    companyId?: number;
    location?: string;
    employmentType?: string;
}

export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PositionListResponse {
    positions: Position[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

/**
 * Obtiene posiciones activas con paginación
 * @param page - Número de página (por defecto 1)
 * @param limit - Elementos por página (por defecto 10, máximo 50)
 * @returns Lista de posiciones con información de paginación
 */
export const getActivePositions = async (
    page: number = 1, 
    limit: number = 10
): Promise<PositionListResponse> => {
    try {
        // Validar parámetros de paginación
        const validPage = Math.max(1, page);
        const validLimit = Math.min(Math.max(1, limit), 50); // Máximo 50 por página

        // Obtener posiciones activas usando el modelo de dominio
        const result = await Position.findActivePositions(validPage, validLimit);
        
        return result;
    } catch (error) {
        console.error('Error en getActivePositions:', error);
        throw new Error('No se pudieron obtener las posiciones abiertas');
    }
};

/**
 * Obtiene una posición específica por ID
 * @param id - ID de la posición
 * @returns Posición encontrada o null si no existe
 */
export const getPositionById = async (id: number): Promise<Position | null> => {
    try {
        if (!id || isNaN(id)) {
            throw new Error('ID de posición inválido');
        }

        const position = await Position.findOne(id);
        return position;
    } catch (error) {
        console.error('Error en getPositionById:', error);
        throw new Error('No se pudo obtener la posición');
    }
};

/**
 * Obtiene posiciones con filtros personalizados
 * @param filters - Filtros a aplicar
 * @param pagination - Parámetros de paginación
 * @returns Lista filtrada de posiciones
 */
export const getPositionsWithFilters = async (
    filters: PositionFilters,
    pagination: PaginationParams
): Promise<PositionListResponse> => {
    try {
        // Por ahora, redirigimos a getActivePositions
        // En el futuro se puede implementar filtros más avanzados
        return await getActivePositions(pagination.page, pagination.limit);
    } catch (error) {
        console.error('Error en getPositionsWithFilters:', error);
        throw new Error('No se pudieron obtener las posiciones con filtros');
    }
};
