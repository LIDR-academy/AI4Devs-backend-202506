/**
 * Servicio de API para la gestión de posiciones
 * Consume los endpoints del backend para operaciones con posiciones
 */

const API_BASE_URL = 'http://localhost:3010';

/**
 * Obtiene lista de posiciones activas con paginación
 * @param {number} page - Número de página (por defecto 1)
 * @param {number} limit - Elementos por página (por defecto 10, máximo 50)
 * @returns {Promise<Object>} Lista de posiciones con información de paginación
 */
export const getActivePositions = async (page = 1, limit = 10) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/positions?page=${page}&limit=${limit}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching active positions:', error);
        throw new Error('No se pudieron obtener las posiciones activas');
    }
};

/**
 * Obtiene una posición específica por ID
 * @param {number} id - ID de la posición
 * @returns {Promise<Object>} Posición encontrada
 */
export const getPositionById = async (id) => {
    try {
        if (!id || isNaN(id)) {
            throw new Error('ID de posición inválido');
        }

        const response = await fetch(`${API_BASE_URL}/positions/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching position by ID:', error);
        throw new Error('No se pudo obtener la posición');
    }
};

/**
 * Obtiene posiciones con filtros personalizados
 * @param {Object} filters - Filtros a aplicar
 * @param {Object} pagination - Parámetros de paginación
 * @returns {Promise<Object>} Lista filtrada de posiciones
 */
export const getPositionsWithFilters = async (filters = {}, pagination = { page: 1, limit: 10 }) => {
    try {
        // Construir query string para filtros
        const queryParams = new URLSearchParams();
        
        // Parámetros de paginación
        queryParams.append('page', pagination.page.toString());
        queryParams.append('limit', pagination.limit.toString());
        
        // Filtros
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.isVisible !== undefined) queryParams.append('isVisible', filters.isVisible.toString());
        if (filters.companyId) queryParams.append('companyId', filters.companyId.toString());
        if (filters.location) queryParams.append('location', filters.location);
        if (filters.employmentType) queryParams.append('employmentType', filters.employmentType);

        const response = await fetch(
            `${API_BASE_URL}/positions/filtered?${queryParams.toString()}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching filtered positions:', error);
        throw new Error('No se pudieron obtener las posiciones con filtros');
    }
};

/**
 * Formatea el salario para mostrar en la UI
 * @param {number} salary - Salario en números
 * @returns {string} Salario formateado
 */
export const formatSalary = (salary) => {
    if (!salary) return 'No especificado';
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(salary);
};

/**
 * Formatea la fecha para mostrar en la UI
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (date) => {
    if (!date) return 'No especificada';
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

/**
 * Obtiene el estado visual de la posición
 * @param {string} status - Estado de la posición
 * @returns {Object} Información del estado (texto, clase CSS, color)
 */
export const getPositionStatusInfo = (status) => {
    const statusMap = {
        'Open': {
            text: 'Abierta',
            className: 'badge bg-success',
            color: 'success'
        },
        'Active': {
            text: 'Activa',
            className: 'badge bg-success',
            color: 'success'
        },
        'Draft': {
            text: 'Borrador',
            className: 'badge bg-secondary',
            color: 'secondary'
        },
        'Closed': {
            text: 'Cerrada',
            className: 'badge bg-danger',
            color: 'danger'
        },
        'On Hold': {
            text: 'En Pausa',
            className: 'badge bg-warning',
            color: 'warning'
        }
    };

    return statusMap[status] || {
        text: status || 'Desconocido',
        className: 'badge bg-info',
        color: 'info'
    };
};
