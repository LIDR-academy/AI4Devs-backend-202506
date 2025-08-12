import { Router } from 'express';
import { 
    getActivePositionsController, 
    getPositionByIdController, 
    getPositionsWithFiltersController 
} from '../presentation/controllers/positionController';

const router = Router();

/**
 * Rutas para la gestión de posiciones
 * Todas las rutas requieren autenticación (se puede agregar middleware de auth)
 */

/**
 * GET /positions
 * Obtiene lista de posiciones activas con paginación
 * Query params: page (opcional, default: 1), limit (opcional, default: 10, max: 50)
 * 
 * Ejemplo: GET /positions?page=1&limit=20
 */
router.get('/', getActivePositionsController);

/**
 * GET /positions/filtered
 * Obtiene posiciones con filtros personalizados
 * Query params: 
 * - page, limit (paginación)
 * - status, isVisible, companyId, location, employmentType (filtros)
 * 
 * Ejemplo: GET /positions/filtered?location=Madrid&employmentType=Full-time&page=1&limit=15
 */
router.get('/filtered', getPositionsWithFiltersController);

/**
 * GET /positions/:id
 * Obtiene una posición específica por ID
 * Params: id (número entero positivo)
 * 
 * Ejemplo: GET /positions/123
 */
router.get('/:id', getPositionByIdController);

export default router;
