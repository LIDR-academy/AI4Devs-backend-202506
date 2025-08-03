import { Request, Response } from 'express';
import { CandidateStageService } from '../../application/services/candidateStageService';

export class CandidateStageController {
    private candidateStageService: CandidateStageService;

    constructor() {
        this.candidateStageService = new CandidateStageService();
    }

    /**
     * Updates the candidate's stage to the next stage in the interview process
     * @param req Express request object containing candidateId parameter
     * @param res Express response object
     */
    async advanceToNextStage(req: Request, res: Response): Promise<void> {
        try {
            const candidateId = parseInt(req.params.candidateId);
            
            if (isNaN(candidateId)) {
                res.status(400).json({ error: 'Invalid candidate ID' });
                return;
            }

            const result = await this.candidateStageService.advanceToNextStage(candidateId);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error) {
                switch (error.message) {
                    case 'Candidate application not found':
                        res.status(404).json({ error: 'Candidate application not found' });
                        break;
                    case 'Current step not found in interview flow':
                        res.status(400).json({ error: 'Invalid interview step configuration' });
                        break;
                    case 'Candidate is already in the final stage':
                        res.status(400).json({ error: 'Candidate is already in the final stage' });
                        break;
                    default:
                        console.error('Error in advanceToNextStage:', error);
                        res.status(500).json({ error: 'Internal server error' });
                }
            } else {
                console.error('Unknown error in advanceToNextStage:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }

    /**
     * Gets the current stage information for a candidate
     * @param req Express request object containing candidateId parameter
     * @param res Express response object
     */
    async getCurrentStage(req: Request, res: Response): Promise<void> {
        try {
            const candidateId = parseInt(req.params.candidateId);
            
            if (isNaN(candidateId)) {
                res.status(400).json({ error: 'Invalid candidate ID' });
                return;
            }

            const result = await this.candidateStageService.getCurrentStage(candidateId);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error) {
                switch (error.message) {
                    case 'Candidate application not found':
                        res.status(404).json({ error: 'Candidate application not found' });
                        break;
                    default:
                        console.error('Error in getCurrentStage:', error);
                        res.status(500).json({ error: 'Internal server error' });
                }
            } else {
                console.error('Unknown error in getCurrentStage:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
}
