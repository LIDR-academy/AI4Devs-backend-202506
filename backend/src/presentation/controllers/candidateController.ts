import { Request, Response } from 'express';
import { addCandidate, findCandidateById, updateCandidateStage as updateStageService } from '../../application/services/candidateService';
import { StageUpdateRequest } from '../../domain/models/ApplicationStage';

export const addCandidateController = async (req: Request, res: Response) => {
    try {
        const candidateData = req.body;
        const candidate = await addCandidate(candidateData);
        res.status(201).json({ message: 'Candidate added successfully', data: candidate });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(400).json({ message: 'Error adding candidate', error: error.message });
        } else {
            res.status(400).json({ message: 'Error adding candidate', error: 'Unknown error' });
        }
    }
};

export const getCandidateById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const candidate = await findCandidateById(id);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Controlador para actualizar la etapa del proceso de entrevista de un candidato
 * PUT /candidates/:id/stage
 */
export const updateCandidateStage = async (req: Request, res: Response) => {
  try {
    // Extraer y validar el ID del candidato
    const candidateId = parseInt(req.params.id);
    
    // Validación básica del parámetro ID
    if (isNaN(candidateId) || candidateId <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CANDIDATE_ID',
          message: 'El ID del candidato debe ser un número entero válido',
          details: 'El parámetro \'id\' recibido no es un número entero válido'
        }
      });
    }

    // Validar estructura del cuerpo de la petición
    const stageUpdateData: StageUpdateRequest = req.body;
    
    if (!stageUpdateData || !stageUpdateData.newStage) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST_BODY',
          message: 'El campo \'newStage\' es requerido',
          details: 'El cuerpo de la petición debe contener un campo \'newStage\' válido'
        }
      });
    }

    // Validar longitud de notes si se proporciona
    if (stageUpdateData.notes && stageUpdateData.notes.length > 500) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_NOTES_LENGTH',
          message: 'Las notas no pueden exceder 500 caracteres',
          details: 'El campo \'notes\' debe tener máximo 500 caracteres'
        }
      });
    }

    // Llamar al servicio para actualizar la etapa
    const result = await updateStageService(candidateId, stageUpdateData);

    // Si el candidato no existe
    if (!result) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CANDIDATE_NOT_FOUND',
          message: 'El candidato especificado no existe',
          details: 'No se encontró ningún candidato con el ID proporcionado'
        }
      });
    }

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error: any) {
    // Log del error para debugging
    console.error('Error en updateCandidateStage:', error);

    // Manejo de errores específicos de negocio
    if (error.message === 'NO_ACTIVE_APPLICATION') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_ACTIVE_APPLICATION',
          message: 'El candidato no tiene aplicaciones activas',
          details: 'No se encontró ninguna aplicación para actualizar la etapa'
        }
      });
    }

    if (error.message === 'INVALID_STAGE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STAGE',
          message: 'La etapa especificada no es válida para este candidato',
          details: 'La etapa no existe en el flujo de entrevistas de la posición aplicada'
        }
      });
    }

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

export { addCandidate };