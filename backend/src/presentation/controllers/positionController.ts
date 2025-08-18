import { Request, Response } from 'express';
import { getCandidatesByPositionId } from '../../application/services/positionService';

/**
 * Controlador para obtener todos los candidatos de una posición específica
 * GET /positions/:id/candidates
 */
export const getCandidatesByPosition = async (req: Request, res: Response) => {
  try {
    // Extraer y validar el ID de la posición
    const positionId = parseInt(req.params.id);
    
    // Validación básica del parámetro ID
    if (isNaN(positionId) || positionId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_POSITION_ID',
          message: 'El ID de la posición debe ser un número entero válido',
          details: 'El parámetro \'id\' recibido no es un número entero válido'
        }
      });
    }

    // Llamar al servicio para obtener los candidatos
    const result = await getCandidatesByPositionId(positionId);

    // Si la posición no existe
    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'POSITION_NOT_FOUND',
          message: 'La posición especificada no existe',
          details: 'No se encontró ninguna posición con el ID proporcionado'
        }
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    // Log del error para debugging
    console.error('Error en getCandidatesByPosition:', error);

    // Respuesta de error interno
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error interno del servidor',
        details: 'Ha ocurrido un error inesperado en el servidor'
      }
    });
  }
};
