import { Router } from 'express';
import { 
    getPositionKanban, 
    getPositionKanbanStatistics, 
    getPositionInterviewSteps,
    checkKanbanHealth,
    validateKanbanAccess 
} from '../presentation/controllers/kanbanController';

/**
 * Rutas para la gestión del tablero Kanban de candidatos
 * Configuración de endpoints y middleware para operaciones con el Kanban
 */

const router = Router();

/**
 * Middleware aplicado a todas las rutas del Kanban
 * - validateKanbanAccess: Validación de permisos (preparado para futuro)
 * - Logging automático de requests
 */
router.use('/positions/:id/kanban*', validateKanbanAccess);

/**
 * GET /positions/:id/kanban
 * Obtiene los datos completos del tablero Kanban para una posición específica
 * 
 * Parámetros:
 * - id (path): ID de la posición (número entero positivo)
 * 
 * Respuestas:
 * - 200: Datos del Kanban obtenidos exitosamente
 * - 400: ID inválido o posición sin etapas configuradas
 * - 404: Posición no encontrada
 * - 500: Error interno del servidor
 * 
 * Ejemplo de uso:
 * GET /api/positions/1/kanban
 */
router.get('/positions/:id/kanban', getPositionKanban);

/**
 * GET /positions/:id/kanban/statistics
 * Obtiene estadísticas del tablero Kanban (total candidatos, distribución, scores)
 * 
 * Parámetros:
 * - id (path): ID de la posición (número entero positivo)
 * 
 * Respuestas:
 * - 200: Estadísticas obtenidas exitosamente
 * - 400: ID inválido o posición sin etapas configuradas
 * - 404: Posición no encontrada
 * - 500: Error interno del servidor
 * 
 * Ejemplo de uso:
 * GET /api/positions/1/kanban/statistics
 */
router.get('/positions/:id/kanban/statistics', getPositionKanbanStatistics);

/**
 * GET /positions/:id/kanban/health
 * Verifica el estado de configuración del Kanban para una posición
 * Útil para validar si una posición puede mostrar el tablero Kanban
 * 
 * Parámetros:
 * - id (path): ID de la posición (número entero positivo)
 * 
 * Respuestas:
 * - 200: Kanban configurado correctamente
 * - 400: Kanban no disponible (sin etapas configuradas)
 * - 404: Posición no encontrada
 * - 500: Error interno del servidor
 * 
 * Ejemplo de uso:
 * GET /api/positions/1/kanban/health
 */
router.get('/positions/:id/kanban/health', checkKanbanHealth);

/**
 * GET /positions/:id/interview-steps
 * Obtiene las etapas de entrevista configuradas para una posición
 * Información útil para entender la estructura del Kanban
 * 
 * Parámetros:
 * - id (path): ID de la posición (número entero positivo)
 * 
 * Respuestas:
 * - 200: Etapas de entrevista obtenidas exitosamente
 * - 400: ID inválido
 * - 404: Posición no encontrada o sin InterviewFlow configurado
 * - 500: Error interno del servidor
 * 
 * Ejemplo de uso:
 * GET /api/positions/1/interview-steps
 */
router.get('/positions/:id/interview-steps', getPositionInterviewSteps);

/**
 * Middleware de manejo de errores específico para rutas del Kanban
 * Captura errores no manejados y proporciona respuestas consistentes
 */
router.use((error: any, req: any, res: any, next: any) => {
    console.error('[KANBAN ROUTES] Error no manejado:', error);
    
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'Ocurrió un error inesperado en las rutas del Kanban'
    });
});

export default router;
