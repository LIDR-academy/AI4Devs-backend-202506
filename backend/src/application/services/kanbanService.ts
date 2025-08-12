import { Position } from '../../domain/models/Position';
import { InterviewStep } from '../../domain/models/InterviewStep';
import { Application } from '../../domain/models/Application';

/**
 * Servicio de aplicación para la gestión del Kanban de candidatos
 * Implementa la lógica de negocio para operaciones con el tablero Kanban
 */

// Interfaces TypeScript para las respuestas del Kanban
export interface KanbanPosition {
    id: number;
    title: string;
    company: { name: string };
}

export interface KanbanCandidate {
    applicationId: number;
    candidateId: number;
    firstName: string;
    lastName: string;
    averageScore: number;
    lastInterviewDate?: Date;
}

export interface KanbanColumn {
    id: number | 'application';
    name: string;
    orderIndex: number;
    candidates: KanbanCandidate[];
}

export interface KanbanData {
    position: KanbanPosition;
    columns: KanbanColumn[];
}

export interface KanbanError {
    error: string;
    message: string;
}

/**
 * Obtiene los datos completos del Kanban para una posición específica
 * @param positionId - ID de la posición
 * @returns Datos del Kanban con posición, columnas y candidatos organizados
 * @throws Error si la posición no existe o no tiene etapas definidas
 */
export const getKanbanData = async (positionId: number): Promise<KanbanData> => {
    try {
        // 1. Validar que el positionId es válido
        if (!positionId || isNaN(positionId) || positionId < 1) {
            throw new Error('ID de posición inválido');
        }

        // 2. Validar que la posición tenga un InterviewFlow válido
        const hasValidFlow = await validateInterviewFlow(positionId);
        if (!hasValidFlow) {
            throw new Error('Esta posición no tiene definidas etapas');
        }

        // 3. Obtener datos completos del Kanban usando el modelo de dominio
        const kanbanData = await Position.getKanbanData(positionId);

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

    } catch (error) {
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

/**
 * Valida que una posición tenga InterviewFlow e InterviewSteps configurados
 * @param positionId - ID de la posición a validar
 * @returns true si tiene configuración válida, false en caso contrario
 */
export const validateInterviewFlow = async (positionId: number): Promise<boolean> => {
    try {
        return await Position.validateInterviewFlow(positionId);
    } catch (error) {
        console.error('Error en validateInterviewFlow:', error);
        return false;
    }
};

/**
 * Calcula el score promedio de todas las entrevistas de una aplicación
 * @param applicationId - ID de la aplicación
 * @returns Score promedio redondeado a 1 decimal (0-5)
 */
export const calculateCandidateScores = async (applicationId: number): Promise<number> => {
    try {
        if (!applicationId || isNaN(applicationId) || applicationId < 1) {
            throw new Error('ID de aplicación inválido');
        }

        const averageScore = await Application.calculateAverageScore(applicationId);
        return averageScore;

    } catch (error) {
        console.error('Error en calculateCandidateScores:', error);
        return 0; // Score por defecto en caso de error
    }
};

/**
 * Obtiene información detallada de las etapas de entrevista para una posición
 * @param positionId - ID de la posición
 * @returns Array de etapas de entrevista ordenadas
 */
export const getInterviewStepsForPosition = async (positionId: number): Promise<Array<{
    id: number;
    name: string;
    orderIndex: number;
    interviewType?: {
        name: string;
        description?: string;
    };
}>> => {
    try {
        // 1. Obtener la posición con su InterviewFlow
        const position = await Position.findOne(positionId);
        if (!position) {
            throw new Error('Posición no encontrada');
        }

        if (!position.interviewFlowId) {
            throw new Error('La posición no tiene un InterviewFlow configurado');
        }

        // 2. Obtener los InterviewSteps del InterviewFlow
        const interviewSteps = await InterviewStep.findByInterviewFlow(position.interviewFlowId);

        // 3. Mapear a formato requerido
        return interviewSteps.map(step => ({
            id: step.id!,
            name: step.name,
            orderIndex: step.orderIndex,
            interviewType: {
                name: (step as any).interviewType?.name || 'Tipo no especificado',
                description: (step as any).interviewType?.description
            }
        }));

    } catch (error) {
        console.error('Error en getInterviewStepsForPosition:', error);
        throw new Error('No se pudieron obtener las etapas de entrevista');
    }
};

/**
 * Obtiene estadísticas resumidas del Kanban
 * @param positionId - ID de la posición
 * @returns Estadísticas del tablero Kanban
 */
export const getKanbanStatistics = async (positionId: number): Promise<{
    totalCandidates: number;
    candidatesWithInterviews: number;
    candidatesWithoutInterviews: number;
    averageScoreOverall: number;
    columnDistribution: Array<{
        columnName: string;
        candidateCount: number;
        averageScore: number;
    }>;
}> => {
    try {
        const kanbanData = await getKanbanData(positionId);
        
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
            } else {
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

    } catch (error) {
        console.error('Error en getKanbanStatistics:', error);
        throw new Error('No se pudieron obtener las estadísticas del Kanban');
    }
};

/**
 * Valida los datos de entrada para operaciones del Kanban
 * @param positionId - ID de la posición a validar
 * @returns objeto con validación y mensaje de error si aplica
 */
export const validateKanbanRequest = (positionId: any): { 
    isValid: boolean; 
    error?: string; 
    normalizedId?: number; 
} => {
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

/**
 * Formatea los datos del Kanban para la respuesta del API
 * @param kanbanData - Datos del Kanban
 * @returns Datos formateados para la respuesta
 */
export const formatKanbanResponse = (kanbanData: KanbanData) => {
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

/**
 * Formatea errores del Kanban para la respuesta del API
 * @param error - Error a formatear
 * @returns Respuesta de error formateada
 */
export const formatKanbanError = (error: Error) => {
    let statusCode = 500;
    let errorType = 'Error interno del servidor';

    // Determinar tipo de error y código de estado apropiado
    if (error.message.includes('no tiene definidas etapas')) {
        statusCode = 400;
        errorType = 'Configuración inválida';
    } else if (error.message.includes('ID de posición inválido') || 
               error.message.includes('debe ser un número válido') ||
               error.message.includes('debe ser mayor a 0')) {
        statusCode = 400;
        errorType = 'Parámetros inválidos';
    } else if (error.message.includes('Posición no encontrada')) {
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
