import { Request, Response } from 'express';
import { addCandidate, findCandidateById, updateCandidateStage as updateStage } from '../../application/services/candidateService';

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
        const candidateId = parseInt(req.params.id);
        const { stageId } = req.body;

        if (isNaN(candidateId) || candidateId <= 0) {
            return res.status(400).json({ message: 'Invalid candidate ID' });
        }

        if (!stageId || typeof stageId !== 'number' || stageId <= 0) {
            return res.status(400).json({ message: 'Invalid stage ID' });
        }

        const result = await updateStage(candidateId, stageId);
        res.status(200).json({ 
            message: 'Candidate stage updated successfully', 
            data: result 
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('not found')) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('Invalid')) {
                return res.status(400).json({ message: error.message });
            }
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export { addCandidate };