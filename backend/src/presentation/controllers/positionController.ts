import { Request, Response } from 'express';
import { getCandidatesByPosition, updateCandidateStage } from '../../application/services/positionService';

/**
 * GET /positions/:id/candidates
 * Get all candidates in process for a specific position (for Kanban interface)
 */
export const getCandidatesByPositionController = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        
        if (isNaN(positionId)) {
            return res.status(400).json({ 
                error: 'Invalid position ID format',
                message: 'Position ID must be a valid number' 
            });
        }

        const candidates = await getCandidatesByPosition(positionId);
        
        // Handle case when no candidates are found
        const response = {
            success: true,
            data: candidates,
            meta: {
                positionId: positionId,
                totalCandidates: candidates.length,
                message: candidates.length === 0 
                    ? 'No candidates found in process for this position'
                    : `Found ${candidates.length} candidate(s) in process`
            }
        };

        res.json(response);

    } catch (error: any) {
        console.error('Error in getCandidatesByPositionController:', error);
        
        if (error.message.includes('not found')) {
            return res.status(404).json({ 
                error: 'Position not found',
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: 'Failed to retrieve candidates for position' 
        });
    }
};

/**
 * PUT /candidates/:id/stage
 * Update the current interview stage for a candidate
 */
export const updateCandidateStageController = async (req: Request, res: Response) => {
    try {
        const candidateId = parseInt(req.params.id);
        const { newStageId } = req.body;
        
        if (isNaN(candidateId)) {
            return res.status(400).json({ 
                error: 'Invalid candidate ID format',
                message: 'Candidate ID must be a valid number' 
            });
        }

        if (!newStageId || isNaN(parseInt(newStageId))) {
            return res.status(400).json({ 
                error: 'Invalid stage ID',
                message: 'newStageId is required and must be a valid number' 
            });
        }

        const result = await updateCandidateStage(candidateId, parseInt(newStageId));
        
        res.json(result);

    } catch (error: any) {
        console.error('Error in updateCandidateStageController:', error);
        
        if (error.message.includes('not found')) {
            return res.status(404).json({ 
                error: 'Resource not found',
                message: error.message 
            });
        }
        
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: 'Failed to update candidate stage' 
        });
    }
};
