import { Request, Response } from 'express';
import { getCandidatesByPosition } from '../../application/services/positionService';

export const getCandidatesByPositionController = async (req: Request, res: Response) => {
    try {
        console.log(`${new Date().toISOString()} - GET /positions/${req.params.id}/candidates - Request received`);
        
        const positionId = parseInt(req.params.id);
        
        if (isNaN(positionId)) {
            console.log(`${new Date().toISOString()} - Invalid position ID format: ${req.params.id}`);
            return res.status(400).json({ 
                error: 'Invalid position ID format. Expected a numeric value.' 
            });
        }

        if (positionId <= 0) {
            console.log(`${new Date().toISOString()} - Invalid position ID value: ${positionId}`);
            return res.status(400).json({ 
                error: 'Invalid position ID. Must be a positive number.' 
            });
        }

        const result = await getCandidatesByPosition(positionId);
        
        console.log(`${new Date().toISOString()} - Successfully retrieved ${result.totalCandidates} candidates for position ${positionId}`);
        
        res.status(200).json({
            message: 'Candidates retrieved successfully',
            data: result
        });

    } catch (error: unknown) {
        console.error(`${new Date().toISOString()} - Error in getCandidatesByPositionController:`, error);
        
        if (error instanceof Error) {
            if (error.message === 'Position not found') {
                return res.status(404).json({ 
                    error: 'Position not found',
                    message: `No position found with ID ${req.params.id}` 
                });
            }
            
            if (error.message === 'Invalid position ID provided') {
                return res.status(400).json({ 
                    error: 'Invalid position ID',
                    message: error.message 
                });
            }
            
            res.status(500).json({ 
                error: 'Internal server error',
                message: 'An error occurred while retrieving candidates' 
            });
        } else {
            res.status(500).json({ 
                error: 'Internal server error',
                message: 'An unexpected error occurred' 
            });
        }
    }
};