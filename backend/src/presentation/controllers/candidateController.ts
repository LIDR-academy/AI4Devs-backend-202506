import { Request, Response } from 'express';
import { addCandidate, findCandidateById } from '../../application/services/candidateService';

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

// Controlador para actualizar la etapa del candidato
import { updateCandidateStage } from '../../application/services/candidateService';

export const updateCandidateStageController = async (req: Request, res: Response) => {
    const candidateId = parseInt(req.params.id);
    const { interviewStepId, applicationId } = req.body;
    if (!interviewStepId) {
        return res.status(400).json({ error: 'interviewStepId es requerido en el body.' });
    }
    try {
        const result = await updateCandidateStage(candidateId, interviewStepId, applicationId);
        if (!result) {
            return res.status(404).json({ error: 'No se encontró la postulación activa para el candidato.' });
        }
        return res.json({ message: 'Etapa actualizada correctamente', application: result });
    } catch (error: any) {
        return res.status(500).json({ error: error.message || 'Error al actualizar la etapa.' });
    }
};

export { addCandidate };