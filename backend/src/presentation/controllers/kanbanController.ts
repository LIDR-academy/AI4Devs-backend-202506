import { Request, Response } from 'express';
import { 
    getKanbanData, 
    validateKanbanRequest, 
    formatKanbanResponse, 
    formatKanbanError,
    getKanbanStatistics,
    getInterviewStepsForPosition
} from '../../application/services/kanbanService';

/**
 * Controlador para la gestión del tablero Kanban de candidatos
 * Maneja las peticiones HTTP y respuestas para operaciones con el Kanban
 */

/**
 * GET /positions/:id/kanban - Obtiene los datos completos del tablero Kanban para una posición
 * 
 * @param req - Request con el ID de la posición en params
 * @param res - Response con los datos del Kanban o error
 * 
 * Respuesta exitosa (200):
 * {
 *   "success": true,
 *   "message": "Datos del tablero Kanban obtenidos exitosamente",
 *   "data": {
 *     "position": { "id": 1, "title": "...", "company": { "name": "..." } },
 *     "columns": [...]
 *   }
 * }
 * 
 * Respuestas de error:
 * - 400: Parámetros inválidos o posición sin etapas definidas
 * - 404: Posición no encontrada
 * - 500: Error interno del servidor
 */
export const getPositionKanban = async (req: Request, res: Response) => {
    try {
        // 1. Validar parámetros de entrada
        const positionIdParam = req.params.id;
        const validation = validateKanbanRequest(positionIdParam);
        
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: 'Parámetros inválidos',
                message: validation.error
            });
        }

        const positionId = validation.normalizedId!;

        // 2. Log de la operación para auditoría
        console.log(`[KANBAN] Solicitando datos del Kanban para posición ${positionId}`);

        // 3. Obtener datos del Kanban usando el servicio
        const kanbanData = await getKanbanData(positionId);

        // 4. Formatear respuesta exitosa
        const formattedResponse = formatKanbanResponse(kanbanData);

        // 5. Log de éxito
        console.log(`[KANBAN] Datos del Kanban obtenidos exitosamente para posición ${positionId} - ${kanbanData.columns.length} columnas, ${kanbanData.columns.reduce((total, col) => total + col.candidates.length, 0)} candidatos`);

        // 6. Enviar respuesta exitosa
        res.status(200).json(formattedResponse);

    } catch (error) {
        // 7. Log del error para debugging
        console.error(`[KANBAN] Error en getPositionKanban:`, error);

        // 8. Formatear y enviar respuesta de error
        if (error instanceof Error) {
            const formattedError = formatKanbanError(error);
            res.status(formattedError.statusCode).json(formattedError.response);
        } else {
            // Error desconocido
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'Ocurrió un error inesperado al obtener los datos del Kanban'
            });
        }
    }
};

/**
 * GET /positions/:id/kanban/statistics - Obtiene estadísticas del tablero Kanban
 * 
 * @param req - Request con el ID de la posición en params
 * @param res - Response con las estadísticas del Kanban
 * 
 * Respuesta exitosa (200):
 * {
 *   "success": true,
 *   "message": "Estadísticas del Kanban obtenidas exitosamente",
 *   "data": {
 *     "totalCandidates": 5,
 *     "candidatesWithInterviews": 3,
 *     "candidatesWithoutInterviews": 2,
 *     "averageScoreOverall": 3.8,
 *     "columnDistribution": [...]
 *   }
 * }
 */
export const getPositionKanbanStatistics = async (req: Request, res: Response) => {
    try {
        // 1. Validar parámetros de entrada
        const positionIdParam = req.params.id;
        const validation = validateKanbanRequest(positionIdParam);
        
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: 'Parámetros inválidos',
                message: validation.error
            });
        }

        const positionId = validation.normalizedId!;

        // 2. Log de la operación
        console.log(`[KANBAN] Solicitando estadísticas del Kanban para posición ${positionId}`);

        // 3. Obtener estadísticas usando el servicio
        const statistics = await getKanbanStatistics(positionId);

        // 4. Log de éxito
        console.log(`[KANBAN] Estadísticas obtenidas - Total: ${statistics.totalCandidates}, Promedio: ${statistics.averageScoreOverall}`);

        // 5. Enviar respuesta exitosa
        res.status(200).json({
            success: true,
            message: 'Estadísticas del Kanban obtenidas exitosamente',
            data: statistics
        });

    } catch (error) {
        console.error(`[KANBAN] Error en getPositionKanbanStatistics:`, error);

        if (error instanceof Error) {
            const formattedError = formatKanbanError(error);
            res.status(formattedError.statusCode).json(formattedError.response);
        } else {
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'Ocurrió un error inesperado al obtener las estadísticas del Kanban'
            });
        }
    }
};

/**
 * GET /positions/:id/interview-steps - Obtiene las etapas de entrevista de una posición
 * 
 * @param req - Request con el ID de la posición en params
 * @param res - Response con las etapas de entrevista
 * 
 * Respuesta exitosa (200):
 * {
 *   "success": true,
 *   "message": "Etapas de entrevista obtenidas exitosamente",
 *   "data": {
 *     "positionId": 1,
 *     "steps": [
 *       {
 *         "id": 1,
 *         "name": "Initial Screening",
 *         "orderIndex": 1,
 *         "interviewType": { "name": "Phone Interview" }
 *       }
 *     ]
 *   }
 * }
 */
export const getPositionInterviewSteps = async (req: Request, res: Response) => {
    try {
        // 1. Validar parámetros de entrada
        const positionIdParam = req.params.id;
        const validation = validateKanbanRequest(positionIdParam);
        
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: 'Parámetros inválidos',
                message: validation.error
            });
        }

        const positionId = validation.normalizedId!;

        // 2. Log de la operación
        console.log(`[KANBAN] Solicitando etapas de entrevista para posición ${positionId}`);

        // 3. Obtener etapas de entrevista usando el servicio
        const interviewSteps = await getInterviewStepsForPosition(positionId);

        // 4. Log de éxito
        console.log(`[KANBAN] ${interviewSteps.length} etapas de entrevista obtenidas para posición ${positionId}`);

        // 5. Enviar respuesta exitosa
        res.status(200).json({
            success: true,
            message: 'Etapas de entrevista obtenidas exitosamente',
            data: {
                positionId: positionId,
                steps: interviewSteps
            }
        });

    } catch (error) {
        console.error(`[KANBAN] Error en getPositionInterviewSteps:`, error);

        if (error instanceof Error) {
            const formattedError = formatKanbanError(error);
            res.status(formattedError.statusCode).json(formattedError.response);
        } else {
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
                message: 'Ocurrió un error inesperado al obtener las etapas de entrevista'
            });
        }
    }
};

/**
 * GET /positions/:id/kanban/health - Endpoint de verificación de salud para el Kanban
 * Verifica que una posición esté correctamente configurada para mostrar el Kanban
 * 
 * @param req - Request con el ID de la posición en params
 * @param res - Response con el estado de salud del Kanban
 * 
 * Respuesta exitosa (200):
 * {
 *   "success": true,
 *   "message": "Kanban configurado correctamente",
 *   "data": {
 *     "positionId": 1,
 *     "hasValidInterviewFlow": true,
 *     "numberOfSteps": 3,
 *     "canShowKanban": true
 *   }
 * }
 */
export const checkKanbanHealth = async (req: Request, res: Response) => {
    try {
        // 1. Validar parámetros de entrada
        const positionIdParam = req.params.id;
        const validation = validateKanbanRequest(positionIdParam);
        
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: 'Parámetros inválidos',
                message: validation.error
            });
        }

        const positionId = validation.normalizedId!;

        // 2. Log de la operación
        console.log(`[KANBAN] Verificando salud del Kanban para posición ${positionId}`);

        // 3. Verificar configuración del Kanban
        let hasValidInterviewFlow = false;
        let numberOfSteps = 0;
        let canShowKanban = false;

        try {
            // Intentar obtener las etapas de entrevista
            const interviewSteps = await getInterviewStepsForPosition(positionId);
            hasValidInterviewFlow = true;
            numberOfSteps = interviewSteps.length;
            canShowKanban = numberOfSteps > 0;
        } catch (error) {
            // Si hay error, la posición no está configurada correctamente
            hasValidInterviewFlow = false;
            numberOfSteps = 0;
            canShowKanban = false;
        }

        // 4. Determinar estado y mensaje
        const status = canShowKanban ? 200 : 400;
        const message = canShowKanban 
            ? 'Kanban configurado correctamente' 
            : 'Kanban no disponible - posición sin etapas definidas';

        // 5. Log del resultado
        console.log(`[KANBAN] Health check - Posición ${positionId}: ${canShowKanban ? 'OK' : 'NOK'} - ${numberOfSteps} etapas`);

        // 6. Enviar respuesta
        res.status(status).json({
            success: canShowKanban,
            message: message,
            data: {
                positionId: positionId,
                hasValidInterviewFlow: hasValidInterviewFlow,
                numberOfSteps: numberOfSteps,
                canShowKanban: canShowKanban
            }
        });

    } catch (error) {
        console.error(`[KANBAN] Error en checkKanbanHealth:`, error);

        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: 'Ocurrió un error inesperado al verificar la configuración del Kanban'
        });
    }
};

/**
 * Middleware para validar que el usuario tiene permisos para ver el Kanban de una posición
 * (Para uso futuro cuando se implemente autenticación/autorización)
 * 
 * @param req - Request
 * @param res - Response  
 * @param next - Next function
 */
export const validateKanbanAccess = async (req: Request, res: Response, next: Function) => {
    try {
        // TODO: Implementar validación de permisos cuando se agregue autenticación
        // Por ahora, permitir acceso a todos los usuarios
        
        const positionId = req.params.id;
        console.log(`[KANBAN] Validando acceso al Kanban para posición ${positionId}`);
        
        // Validaciones futuras:
        // - Verificar que el usuario esté autenticado
        // - Verificar que el usuario tenga permisos para ver esta posición
        // - Verificar que la posición pertenezca a la empresa del usuario
        
        next();
        
    } catch (error) {
        console.error('[KANBAN] Error en validateKanbanAccess:', error);
        
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor',
            message: 'Error en la validación de permisos'
        });
    }
};
