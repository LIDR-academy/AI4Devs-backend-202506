import { Request, Response } from 'express';
import { addCandidate, findCandidateById } from '../../application/services/candidateService';
import { setCandidateStage } from '../../application/services/stageService';

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

export { addCandidate };

export const updateCandidateStage = async (req: Request, res: Response) => {
    try {
        const candidateId = parseInt(req.params.id);
        const { positionId, toStepId } = req.body as { positionId: number; toStepId: number };

        if (isNaN(candidateId)) {
            return res.status(400).json({ error: 'Invalid candidate id' });
        }
        if (typeof positionId !== 'number' || typeof toStepId !== 'number') {
            return res.status(400).json({ error: 'positionId and toStepId must be numbers' });
        }

        const updated = await setCandidateStage(candidateId, positionId, toStepId);
        res.status(200).json(updated);
    } catch (error: any) {
        if (error?.status === 404) {
            return res.status(404).json({ error: error.message });
        }
        res.status(400).json({ error: error.message ?? 'Bad Request' });
    }
};