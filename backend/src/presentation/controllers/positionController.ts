import { Request, Response } from 'express';
import { getCandidatesByPosition, updateCandidateStage } from '../../application/services/positionService';

/**
 * Controlador para obtener candidatos por posición
 * GET /positions/:id/candidates
 */
export const getCandidatesByPositionController = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        
        // Validar que el ID es un número válido
        if (isNaN(positionId)) {
            return res.status(400).json({ 
                error: 'Invalid position ID format. Must be a number.' 
            });
        }

        const candidates = await getCandidatesByPosition(positionId);
        
        res.status(200).json(candidates);
    } catch (error) {
        console.error('Error in getCandidatesByPositionController:', error);
        
        if (error instanceof Error) {
            if (error.message === 'Position not found') {
                return res.status(404).json({ 
                    error: 'Position not found' 
                });
            }
            return res.status(500).json({ 
                error: 'Internal server error',
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
};

/**
 * Controlador para actualizar la etapa de un candidato
 * PUT /candidates/:id/stage
 */
export const updateCandidateStageController = async (req: Request, res: Response) => {
    try {
        const candidateId = parseInt(req.params.id);
        const { stage_id } = req.body;
        
        // Validar que el candidateId es un número válido
        if (isNaN(candidateId)) {
            return res.status(400).json({ 
                error: 'Invalid candidate ID format. Must be a number.' 
            });
        }

        // Validar que stage_id está presente y es un número
        if (!stage_id || isNaN(stage_id)) {
            return res.status(400).json({ 
                error: 'stage_id is required and must be a number.' 
            });
        }

        const result = await updateCandidateStage(candidateId, stage_id);
        
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in updateCandidateStageController:', error);
        
        if (error instanceof Error) {
            if (error.message === 'Candidate not found') {
                return res.status(404).json({ 
                    error: 'Candidate not found' 
                });
            }
            if (error.message === 'Interview step not found') {
                return res.status(404).json({ 
                    error: 'Interview step not found' 
                });
            }
            if (error.message === 'No active application found for this candidate') {
                return res.status(404).json({ 
                    error: 'No active application found for this candidate' 
                });
            }
            return res.status(500).json({ 
                error: 'Internal server error',
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
};
