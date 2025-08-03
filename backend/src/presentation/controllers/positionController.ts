import { Request, Response } from 'express';
import { PositionService } from '../../application/services/positionService';

export class PositionController {
    private positionService: PositionService;

    constructor() {
        this.positionService = new PositionService();
    }

    /**
     * Get all candidates for a specific position
     * @param req Express request object containing positionId parameter
     * @param res Express response object
     */
    async getCandidatesByPosition(req: Request, res: Response): Promise<void> {
        try {
            const positionId = parseInt(req.params.positionId);
            
            if (isNaN(positionId)) {
                res.status(400).json({ error: 'Invalid position ID' });
                return;
            }

            const result = await this.positionService.getCandidatesByPosition(positionId);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error && error.message === 'Position not found') {
                res.status(404).json({ error: 'Position not found' });
            } else {
                console.error('Error in getCandidatesByPosition:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
}
