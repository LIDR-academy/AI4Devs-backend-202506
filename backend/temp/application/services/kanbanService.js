"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatKanbanError = exports.formatKanbanResponse = exports.validateKanbanRequest = exports.getKanbanStatistics = exports.getInterviewStepsForPosition = exports.calculateCandidateScores = exports.validateInterviewFlow = exports.getKanbanData = void 0;
const Position_1 = require("../../domain/models/Position");
const InterviewStep_1 = require("../../domain/models/InterviewStep");
const Application_1 = require("../../domain/models/Application");
/**
 * Obtiene los datos completos del Kanban para una posición específica
 * @param positionId - ID de la posición
 * @returns Datos del Kanban con posición, columnas y candidatos organizados
 * @throws Error si la posición no existe o no tiene etapas definidas
 */
const getKanbanData = async (positionId) => {
    try {
        // 1. Validar que el positionId es válido
        if (!positionId || isNaN(positionId) || positionId < 1) {
            throw new Error('ID de posición inválido');
        }
        // 2. Validar que la posición tenga un InterviewFlow válido
        const hasValidFlow = await (0, exports.validateInterviewFlow)(positionId);
        if (!hasValidFlow) {
            throw new Error('Esta posición no tiene definidas etapas');
        }
        // 3. Obtener datos completos del Kanban usando el modelo de dominio
        const kanbanData = await Position_1.Position.getKanbanData(positionId);
        // 4. Validar que se obtuvieron datos válidos
        if (!kanbanData.position || !kanbanData.columns) {
            throw new Error('No se pudieron obtener los datos del Kanban');
        }
        // 5. Ordenar columnas por orderIndex para asegurar orden correcto
        const sortedColumns = kanbanData.columns.sort((a, b) => a.orderIndex - b.orderIndex);
        return {
            position: kanbanData.position,
            columns: sortedColumns
        };
    }
    catch (error) {
        console.error('Error en getKanbanData:', error);
        // Re-lanzar errores conocidos del negocio
        if (error instanceof Error &&
            (error.message.includes('no tiene definidas etapas') ||
                error.message.includes('ID de posición inválido') ||
                error.message.includes('Posición no encontrada'))) {
            throw error;
        }
        // Para otros errores, lanzar error genérico
        throw new Error('No se pudieron obtener los datos del tablero Kanban');
    }
};
exports.getKanbanData = getKanbanData;
/**
 * Valida que una posición tenga InterviewFlow e InterviewSteps configurados
 * @param positionId - ID de la posición a validar
 * @returns true si tiene configuración válida, false en caso contrario
 */
const validateInterviewFlow = async (positionId) => {
    try {
        return await Position_1.Position.validateInterviewFlow(positionId);
    }
    catch (error) {
        console.error('Error en validateInterviewFlow:', error);
        return false;
    }
};
exports.validateInterviewFlow = validateInterviewFlow;
/**
 * Calcula el score promedio de todas las entrevistas de una aplicación
 * @param applicationId - ID de la aplicación
 * @returns Score promedio redondeado a 1 decimal (0-5)
 */
const calculateCandidateScores = async (applicationId) => {
    try {
        if (!applicationId || isNaN(applicationId) || applicationId < 1) {
            throw new Error('ID de aplicación inválido');
        }
        const averageScore = await Application_1.Application.calculateAverageScore(applicationId);
        return averageScore;
    }
    catch (error) {
        console.error('Error en calculateCandidateScores:', error);
        return 0; // Score por defecto en caso de error
    }
};
exports.calculateCandidateScores = calculateCandidateScores;
/**
 * Obtiene información detallada de las etapas de entrevista para una posición
 * @param positionId - ID de la posición
 * @returns Array de etapas de entrevista ordenadas
 */
const getInterviewStepsForPosition = async (positionId) => {
    try {
        // 1. Obtener la posición con su InterviewFlow
        const position = await Position_1.Position.findOne(positionId);
        if (!position) {
            throw new Error('Posición no encontrada');
        }
        if (!position.interviewFlowId) {
            throw new Error('La posición no tiene un InterviewFlow configurado');
        }
        // 2. Obtener los InterviewSteps del InterviewFlow
        const interviewSteps = await InterviewStep_1.InterviewStep.findByInterviewFlow(position.interviewFlowId);
        // 3. Mapear a formato requerido
        return interviewSteps.map(step => ({
            id: step.id,
            name: step.name,
            orderIndex: step.orderIndex,
            interviewType: {
                name: step.interviewType?.name || 'Tipo no especificado',
                description: step.interviewType?.description
            }
        }));
    }
    catch (error) {
        console.error('Error en getInterviewStepsForPosition:', error);
        throw new Error('No se pudieron obtener las etapas de entrevista');
    }
};
exports.getInterviewStepsForPosition = getInterviewStepsForPosition;
/**
 * Obtiene estadísticas resumidas del Kanban
 * @param positionId - ID de la posición
 * @returns Estadísticas del tablero Kanban
 */
const getKanbanStatistics = async (positionId) => {
    try {
        const kanbanData = await (0, exports.getKanbanData)(positionId);
        let totalCandidates = 0;
        let candidatesWithInterviews = 0;
        let candidatesWithoutInterviews = 0;
        let totalScoreSum = 0;
        let candidatesWithScores = 0;
        const columnDistribution = kanbanData.columns.map(column => {
            const candidateCount = column.candidates.length;
            totalCandidates += candidateCount;
            // Calcular estadísticas por columna
            const candidatesWithScore = column.candidates.filter(c => c.averageScore > 0);
            const columnScoreSum = column.candidates.reduce((sum, c) => sum + c.averageScore, 0);
            const columnAverageScore = candidateCount > 0 ? columnScoreSum / candidateCount : 0;
            // Contar candidatos con/sin entrevistas
            if (column.id === 'application') {
                candidatesWithoutInterviews += candidateCount;
            }
            else {
                candidatesWithInterviews += candidateCount;
            }
            // Para promedio general, solo contar candidatos con score > 0
            if (candidatesWithScore.length > 0) {
                totalScoreSum += candidatesWithScore.reduce((sum, c) => sum + c.averageScore, 0);
                candidatesWithScores += candidatesWithScore.length;
            }
            return {
                columnName: column.name,
                candidateCount: candidateCount,
                averageScore: Math.round(columnAverageScore * 10) / 10
            };
        });
        const averageScoreOverall = candidatesWithScores > 0 ?
            Math.round((totalScoreSum / candidatesWithScores) * 10) / 10 : 0;
        return {
            totalCandidates,
            candidatesWithInterviews,
            candidatesWithoutInterviews,
            averageScoreOverall,
            columnDistribution
        };
    }
    catch (error) {
        console.error('Error en getKanbanStatistics:', error);
        throw new Error('No se pudieron obtener las estadísticas del Kanban');
    }
};
exports.getKanbanStatistics = getKanbanStatistics;
/**
 * Valida los datos de entrada para operaciones del Kanban
 * @param positionId - ID de la posición a validar
 * @returns objeto con validación y mensaje de error si aplica
 */
const validateKanbanRequest = (positionId) => {
    // Validar que positionId existe
    if (positionId === undefined || positionId === null) {
        return {
            isValid: false,
            error: 'El ID de la posición es requerido'
        };
    }
    // Convertir a número
    const id = parseInt(positionId);
    // Validar que es un número válido
    if (isNaN(id)) {
        return {
            isValid: false,
            error: 'El ID de la posición debe ser un número válido'
        };
    }
    // Validar que es positivo
    if (id < 1) {
        return {
            isValid: false,
            error: 'El ID de la posición debe ser mayor a 0'
        };
    }
    return {
        isValid: true,
        normalizedId: id
    };
};
exports.validateKanbanRequest = validateKanbanRequest;
/**
 * Formatea los datos del Kanban para la respuesta del API
 * @param kanbanData - Datos del Kanban
 * @returns Datos formateados para la respuesta
 */
const formatKanbanResponse = (kanbanData) => {
    return {
        success: true,
        message: 'Datos del tablero Kanban obtenidos exitosamente',
        data: {
            position: kanbanData.position,
            columns: kanbanData.columns.map(column => ({
                ...column,
                candidates: column.candidates.map(candidate => ({
                    ...candidate,
                    // Asegurar que el score esté formateado a 1 decimal
                    averageScore: Math.round(candidate.averageScore * 10) / 10,
                    // Formatear fecha si existe
                    lastInterviewDate: candidate.lastInterviewDate ?
                        candidate.lastInterviewDate.toISOString() : null
                }))
            }))
        }
    };
};
exports.formatKanbanResponse = formatKanbanResponse;
/**
 * Formatea errores del Kanban para la respuesta del API
 * @param error - Error a formatear
 * @returns Respuesta de error formateada
 */
const formatKanbanError = (error) => {
    let statusCode = 500;
    let errorType = 'Error interno del servidor';
    // Determinar tipo de error y código de estado apropiado
    if (error.message.includes('no tiene definidas etapas')) {
        statusCode = 400;
        errorType = 'Configuración inválida';
    }
    else if (error.message.includes('ID de posición inválido') ||
        error.message.includes('debe ser un número válido') ||
        error.message.includes('debe ser mayor a 0')) {
        statusCode = 400;
        errorType = 'Parámetros inválidos';
    }
    else if (error.message.includes('Posición no encontrada')) {
        statusCode = 404;
        errorType = 'Recurso no encontrado';
    }
    return {
        statusCode,
        response: {
            success: false,
            error: errorType,
            message: error.message
        }
    };
};
exports.formatKanbanError = formatKanbanError;
