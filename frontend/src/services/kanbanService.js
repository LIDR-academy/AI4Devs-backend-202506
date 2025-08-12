/**
 * Servicio de API para la gestión del tablero Kanban de candidatos
 * Consume los endpoints del backend para operaciones con el Kanban
 */

const API_BASE_URL = 'http://localhost:3010';

/**
 * Obtiene los datos completos del tablero Kanban para una posición específica
 * @param {number} positionId - ID de la posición
 * @returns {Promise<Object>} Datos del Kanban con posición, columnas y candidatos
 */
export const getKanbanData = async (positionId) => {
    try {
        // Validar parámetros de entrada
        if (!positionId || isNaN(positionId)) {
            throw new Error('ID de posición inválido');
        }

        const response = await fetch(
            `${API_BASE_URL}/api/positions/${positionId}/kanban`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
            
            if (response.status === 400) {
                throw new Error(errorData.message || 'Esta posición no tiene definidas etapas');
            } else if (response.status === 404) {
                throw new Error('Posición no encontrada');
            } else {
                throw new Error(errorData.message || `Error del servidor: ${response.status}`);
            }
        }

        const data = await response.json();
        
        // Validar estructura de respuesta
        if (!data.success || !data.data) {
            throw new Error('Respuesta inválida del servidor');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching kanban data:', error);
        throw error; // Re-lanzar para que el componente pueda manejar el error específico
    }
};

/**
 * Obtiene estadísticas del tablero Kanban para una posición
 * @param {number} positionId - ID de la posición
 * @returns {Promise<Object>} Estadísticas del tablero Kanban
 */
export const getKanbanStatistics = async (positionId) => {
    try {
        if (!positionId || isNaN(positionId)) {
            throw new Error('ID de posición inválido');
        }

        const response = await fetch(
            `${API_BASE_URL}/api/positions/${positionId}/kanban/statistics`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
            throw new Error(errorData.message || `Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success || !data.data) {
            throw new Error('Respuesta inválida del servidor');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching kanban statistics:', error);
        throw error;
    }
};

/**
 * Verifica si una posición puede mostrar el tablero Kanban (health check)
 * @param {number} positionId - ID de la posición
 * @returns {Promise<Object>} Estado de salud del Kanban
 */
export const checkKanbanHealth = async (positionId) => {
    try {
        if (!positionId || isNaN(positionId)) {
            throw new Error('ID de posición inválido');
        }

        const response = await fetch(
            `${API_BASE_URL}/api/positions/${positionId}/kanban/health`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        // Para health check, tanto 200 como 400 son respuestas válidas
        // 200 = Kanban disponible, 400 = Kanban no disponible pero respuesta esperada
        if (response.status !== 200 && response.status !== 400) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.data) {
            throw new Error('Respuesta inválida del servidor');
        }

        return {
            canShowKanban: data.data.canShowKanban,
            hasValidInterviewFlow: data.data.hasValidInterviewFlow,
            numberOfSteps: data.data.numberOfSteps,
            message: data.message
        };
    } catch (error) {
        console.error('Error checking kanban health:', error);
        throw error;
    }
};

/**
 * Obtiene las etapas de entrevista de una posición
 * @param {number} positionId - ID de la posición
 * @returns {Promise<Array>} Array de etapas de entrevista
 */
export const getInterviewSteps = async (positionId) => {
    try {
        if (!positionId || isNaN(positionId)) {
            throw new Error('ID de posición inválido');
        }

        const response = await fetch(
            `${API_BASE_URL}/api/positions/${positionId}/interview-steps`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
            throw new Error(errorData.message || `Error del servidor: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success || !data.data) {
            throw new Error('Respuesta inválida del servidor');
        }

        return data.data.steps;
    } catch (error) {
        console.error('Error fetching interview steps:', error);
        throw error;
    }
};

/**
 * Renderiza estrellas para mostrar el score de un candidato
 * @param {number} score - Score del candidato (0-5)
 * @param {number} maxStars - Número máximo de estrellas (por defecto 5)
 * @returns {Array} Array de objetos con información de cada estrella
 */
export const renderStarRating = (score, maxStars = 5) => {
    const stars = [];
    
    for (let i = 1; i <= maxStars; i++) {
        let starType = 'empty';
        
        if (score >= i) {
            starType = 'full';
        } else if (score >= i - 0.5) {
            starType = 'half';
        }
        
        stars.push({
            id: i,
            type: starType,
            filled: starType === 'full',
            halfFilled: starType === 'half',
            empty: starType === 'empty'
        });
    }
    
    return stars;
};

/**
 * Formatea el score numérico para mostrar en la UI
 * @param {number} score - Score a formatear
 * @returns {string} Score formateado con 1 decimal
 */
export const formatScore = (score) => {
    if (typeof score !== 'number' || isNaN(score)) {
        return '0.0';
    }
    
    return score.toFixed(1);
};

/**
 * Obtiene el color CSS apropiado según el score
 * @param {number} score - Score del candidato (0-5)
 * @returns {string} Clase CSS para el color
 */
export const getScoreColor = (score) => {
    if (score >= 4) {
        return 'text-success'; // Verde para scores altos
    } else if (score >= 2) {
        return 'text-warning'; // Amarillo para scores medios
    } else {
        return 'text-danger'; // Rojo para scores bajos
    }
};

/**
 * Formatea la fecha de la última entrevista
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada o mensaje si no hay fecha
 */
export const formatLastInterviewDate = (date) => {
    if (!date) {
        return 'Sin entrevista';
    }
    
    const interviewDate = new Date(date);
    const now = new Date();
    const diffInDays = Math.floor((now - interviewDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
        return 'Hoy';
    } else if (diffInDays === 1) {
        return 'Ayer';
    } else if (diffInDays < 7) {
        return `Hace ${diffInDays} días`;
    } else {
        return interviewDate.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        });
    }
};

/**
 * Obtiene el estado visual de una columna del Kanban
 * @param {string} columnName - Nombre de la columna
 * @param {number} candidateCount - Número de candidatos en la columna
 * @returns {Object} Información del estado visual de la columna
 */
export const getColumnStatus = (columnName, candidateCount) => {
    let statusClass = 'kanban-column';
    let badgeClass = 'badge bg-secondary';
    
    if (columnName === 'Aplicación') {
        statusClass += ' kanban-column-application';
        badgeClass = candidateCount > 0 ? 'badge bg-info' : 'badge bg-light';
    } else {
        statusClass += ' kanban-column-interview';
        
        if (candidateCount > 0) {
            badgeClass = 'badge bg-primary';
        } else {
            badgeClass = 'badge bg-light';
        }
    }
    
    return {
        columnClass: statusClass,
        badgeClass: badgeClass,
        isEmpty: candidateCount === 0
    };
};

/**
 * Valida los datos del Kanban antes de renderizar
 * @param {Object} kanbanData - Datos del Kanban a validar
 * @returns {Object} Resultado de la validación
 */
export const validateKanbanData = (kanbanData) => {
    const errors = [];
    
    // Validar estructura básica
    if (!kanbanData) {
        errors.push('Datos del Kanban no disponibles');
        return { isValid: false, errors };
    }
    
    if (!kanbanData.position) {
        errors.push('Información de la posición no disponible');
    }
    
    if (!kanbanData.columns || !Array.isArray(kanbanData.columns)) {
        errors.push('Columnas del Kanban no disponibles');
    } else {
        // Validar que hay al menos una columna
        if (kanbanData.columns.length === 0) {
            errors.push('El Kanban no tiene columnas definidas');
        }
        
        // Validar estructura de columnas
        kanbanData.columns.forEach((column, index) => {
            if (!column.name) {
                errors.push(`Columna ${index + 1} sin nombre`);
            }
            
            if (!Array.isArray(column.candidates)) {
                errors.push(`Columna "${column.name}" sin candidatos válidos`);
            }
        });
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Maneja errores comunes del API del Kanban
 * @param {Error} error - Error a manejar
 * @returns {Object} Error formateado para la UI
 */
export const handleKanbanError = (error) => {
    let userFriendlyMessage = 'Ocurrió un error inesperado';
    let type = 'error';
    let canRetry = true;
    
    if (error.message.includes('no tiene definidas etapas')) {
        userFriendlyMessage = 'Esta posición no tiene configuradas las etapas de entrevista necesarias para mostrar el tablero Kanban.';
        type = 'warning';
        canRetry = false;
    } else if (error.message.includes('Posición no encontrada')) {
        userFriendlyMessage = 'La posición solicitada no existe.';
        type = 'error';
        canRetry = false;
    } else if (error.message.includes('ID de posición inválido')) {
        userFriendlyMessage = 'El identificador de la posición no es válido.';
        type = 'error';
        canRetry = false;
    } else if (error.message.includes('Error del servidor')) {
        userFriendlyMessage = 'Error en el servidor. Por favor, intenta de nuevo en unos minutos.';
        type = 'error';
        canRetry = true;
    } else if (error.message.includes('fetch')) {
        userFriendlyMessage = 'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.';
        type = 'error';
        canRetry = true;
    }
    
    return {
        message: userFriendlyMessage,
        type,
        canRetry,
        originalError: error.message
    };
};

/**
 * Configuración de cache local simple para optimizar requests
 */
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene datos del Kanban con cache opcional
 * @param {number} positionId - ID de la posición
 * @param {boolean} useCache - Si usar cache local (por defecto true)
 * @returns {Promise<Object>} Datos del Kanban
 */
export const getKanbanDataWithCache = async (positionId, useCache = true) => {
    const cacheKey = `kanban_${positionId}`;
    
    // Verificar cache si está habilitado
    if (useCache && cache.has(cacheKey)) {
        const cachedData = cache.get(cacheKey);
        const now = Date.now();
        
        if (now - cachedData.timestamp < CACHE_DURATION) {
            console.log('Usando datos del Kanban desde cache');
            return cachedData.data;
        } else {
            // Cache expirado, eliminarlo
            cache.delete(cacheKey);
        }
    }
    
    // Obtener datos frescos del servidor
    try {
        const data = await getKanbanData(positionId);
        
        // Guardar en cache si está habilitado
        if (useCache) {
            cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
        }
        
        return data;
    } catch (error) {
        // Si hay error y tenemos datos en cache (aunque expirados), usarlos como fallback
        if (cache.has(cacheKey)) {
            console.warn('Usando datos expirados del cache debido a error:', error.message);
            return cache.get(cacheKey).data;
        }
        
        throw error;
    }
};

/**
 * Limpia el cache del Kanban para una posición específica o todo el cache
 * @param {number|null} positionId - ID de la posición (null para limpiar todo)
 */
export const clearKanbanCache = (positionId = null) => {
    if (positionId) {
        const cacheKey = `kanban_${positionId}`;
        cache.delete(cacheKey);
        console.log(`Cache del Kanban limpiado para posición ${positionId}`);
    } else {
        cache.clear();
        console.log('Todo el cache del Kanban limpiado');
    }
};
