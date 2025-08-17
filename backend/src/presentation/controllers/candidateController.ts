import { Request, Response } from 'express';
import { addCandidate, findCandidateById, getCandidatesByPosition, updateApplicationStage } from '../../application/services/candidateService';

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

export const getCandidatesByPositionController = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        if (isNaN(positionId)) {
            return res.status(400).json({ error: 'ID de posición inválido' });
        }
        const candidates = await getCandidatesByPosition(positionId);
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los candidatos de la posición' });
    }
};

export const updateApplicationStageController = async (req: Request, res: Response) => {
    try {
        const applicationId = parseInt(req.params.id);
        const { stageId } = req.body;
        if (isNaN(applicationId) || !stageId) {
            return res.status(400).json({ error: 'Datos inválidos' });
        }
        const updated = await updateApplicationStage(applicationId, stageId);
        res.json(updated);
    } catch (error: any) {
        res.status(400).json({ error: error.message || 'Error al actualizar la etapa' });
    }
};

export { addCandidate };