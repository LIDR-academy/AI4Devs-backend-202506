import { Request, Response, NextFunction } from 'express';
import { candidateService } from '../../application/services/candidateService';

export const addCandidateController = async (req: Request, res: Response) => {
    try {
        const candidateData = req.body;
        const candidate = await candidateService.addCandidate(candidateData);
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
        const candidate = await candidateService.findCandidateById(id);
        if (!candidate) {
            return res.status(404).json({ error: 'Candidate not found' });
        }
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Controlador para actualizar la etapa del candidato (Kanban)
 * @route PUT /candidates/:id/stage
 */
export const updateCandidateStage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidateId = parseInt(req.params.id, 10);
    const { currentInterviewStep } = req.body;
    if (isNaN(candidateId) || typeof currentInterviewStep !== 'number') {
      return res.status(400).json({ error: 'Parámetros inválidos.' });
    }
    // Llama al servicio para actualizar la etapa
    const result = await candidateService.updateCandidateStage(candidateId, currentInterviewStep);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export { candidateService };