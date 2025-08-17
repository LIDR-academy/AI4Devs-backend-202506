import { Request, Response } from 'express';
import { getCandidatesForPosition } from '../../application/services/positionService';

export const getCandidatesForPositionController = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);

        // Validar que el ID es un número válido
        if (isNaN(positionId)) {
            return res.status(400).json({
                error: 'Invalid position ID format',
                message: 'Position ID must be a valid number'
            });
        }

        const candidates = await getCandidatesForPosition(positionId);

        res.status(200).json({
            message: 'Candidates retrieved successfully',
            data: candidates,
            count: candidates.length
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Position not found') {
                return res.status(404).json({
                    error: 'Position not found',
                    message: 'The specified position does not exist'
                });
            }
            return res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        } else {
            return res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred'
            });
        }
    }
}; 