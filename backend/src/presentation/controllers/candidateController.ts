import { Request, Response } from 'express';
import { addCandidate, findCandidateById, updateInterviewStage } from '../../application/services/candidateService';
import { validateStageUpdateData, validateCandidateId } from '../../application/validator';

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

export const updateCandidateStage = async (req: Request, res: Response) => {
    try {
        // 1. Validar parámetros de URL
        const candidateId = validateCandidateId(req.params.id);
        
        // 2. Validar body de la petición
        validateStageUpdateData(req.body);
        
        // 3. Ejecutar lógica de negocio
        const result = await updateInterviewStage(candidateId, req.body);
        
        // 4. Respuesta exitosa con información detallada
        res.status(200).json({
            success: true,
            message: 'Candidate stage updated successfully',
            data: result
        });
        
    } catch (error: any) {
        // Manejo específico de errores HTTP
        
        // 400 - Bad Request: Datos de entrada inválidos
        if (error.message.includes('Invalid') || 
            error.message.includes('required') ||
            error.message.includes('must be') ||
            error.message.includes('format') ||
            error.message.includes('exceed') ||
            error.message.includes('Unexpected fields')) {
            return res.status(400).json({
                success: false,
                error: 'Bad Request',
                message: error.message
            });
        }
        
        // 404 - Not Found: Candidato o aplicación no encontrado
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: error.message
            });
        }
        
        // 409 - Conflict: Transición no permitida
        if (error.message.includes('not allowed') || 
            error.message.includes('skip interview')) {
            return res.status(409).json({
                success: false,
                error: 'Conflict',
                message: error.message
            });
        }
        
        // 422 - Unprocessable Entity: Etapa no pertenece al flujo
        if (error.message.includes('does not belong')) {
            return res.status(422).json({
                success: false,
                error: 'Unprocessable Entity',
                message: error.message
            });
        }
        
        // 500 - Internal Server Error: Errores no específicos
        console.error('Unexpected error in updateCandidateStage:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while updating candidate stage'
        });
    }
};

export { addCandidate };