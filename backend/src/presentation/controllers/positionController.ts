import { Request, Response } from 'express';
import { 
    getActivePositions, 
    getPositionById, 
    getPositionsWithFilters,
    PaginationParams,
    PositionFilters 
} from '../../application/services/positionService';

/**
 * Controlador para la gestión de posiciones
 * Maneja las peticiones HTTP y respuestas para operaciones con posiciones
 */

/**
 * GET /positions - Obtiene lista de posiciones activas con paginación
 */
export const getActivePositionsController = async (req: Request, res: Response) => {
    try {
        // Extraer parámetros de query con valores por defecto
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        // Validar parámetros
        if (page < 1 || limit < 1 || limit > 50) {
            return res.status(400).json({
                error: 'Parámetros de paginación inválidos. page >= 1, 1 <= limit <= 50'
            });
        }

        // Obtener posiciones activas
        const result = await getActivePositions(page, limit);

        // Respuesta exitosa
        res.status(200).json({
            success: true,
            message: 'Posiciones abiertas obtenidas exitosamente',
            data: result.positions,
            pagination: result.pagination
        });

    } catch (error) {
        console.error('Error en getActivePositionsController:', error);
        
        if (error instanceof Error) {
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'Error desconocido'
            });
        }
    }
};

/**
 * GET /positions/:id - Obtiene una posición específica por ID
 */
export const getPositionByIdController = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        // Validar ID
        if (isNaN(id) || id < 1) {
            return res.status(400).json({
                success: false,
                error: 'ID de posición inválido'
            });
        }

        // Obtener posición por ID
        const position = await getPositionById(id);

        if (!position) {
            return res.status(404).json({
                success: false,
                error: 'Posición no encontrada'
            });
        }

        // Respuesta exitosa
        res.status(200).json({
            success: true,
            message: 'Posición obtenida exitosamente',
            data: position
        });

    } catch (error) {
        console.error('Error en getPositionByIdController:', error);
        
        if (error instanceof Error) {
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'Error desconocido'
            });
        }
    }
};

/**
 * GET /positions/filtered - Obtiene posiciones con filtros personalizados
 */
export const getPositionsWithFiltersController = async (req: Request, res: Response) => {
    try {
        // Extraer parámetros de query
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        
        // Extraer filtros
        const filters: PositionFilters = {
            status: req.query.status as string,
            isVisible: req.query.isVisible === 'true' ? true : 
                      req.query.isVisible === 'false' ? false : undefined,
            companyId: req.query.companyId ? parseInt(req.query.companyId as string) : undefined,
            location: req.query.location as string,
            employmentType: req.query.employmentType as string
        };

        // Validar parámetros de paginación
        if (page < 1 || limit < 1 || limit > 50) {
            return res.status(400).json({
                success: false,
                error: 'Parámetros de paginación inválidos. page >= 1, 1 <= limit <= 50'
            });
        }

        // Obtener posiciones con filtros
        const result = await getPositionsWithFilters(filters, { page, limit });

        // Respuesta exitosa
        res.status(200).json({
            success: true,
            message: 'Posiciones filtradas obtenidas exitosamente',
            data: result.positions,
            pagination: result.pagination,
            filters: filters
        });

    } catch (error) {
        console.error('Error en getPositionsWithFiltersController:', error);
        
        if (error instanceof Error) {
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: error.message
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'Error desconocido'
            });
        }
    }
};
