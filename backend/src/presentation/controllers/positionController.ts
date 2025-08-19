import { Request, Response } from 'express';
import { getCandidatesByPosition } from '../../application/services/positionService';

export const getPositionCandidates = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        if (isNaN(positionId)) {
            return res.status(400).json({ error: 'Invalid position ID format' });
        }

        const candidates = await getCandidatesByPosition(positionId);
        res.json(candidates);
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message === 'Position not found') {
                return res.status(404).json({ error: 'Position not found' });
            }
            res.status(500).json({ error: 'Internal Server Error', message: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};
