import { Request, Response, NextFunction } from 'express';
import { candidateService as realCandidateService } from '../../application/services/candidateService';

export function createCandidateControllers(candidateService: typeof realCandidateService) {
  const addCandidateController = async (req: Request, res: Response) => {
    try {
      const candidateData = req.body;
      const candidate = await candidateService.addCandidate(candidateData);
      res.status(201).json({ message: 'Candidate added successfully', data: candidate });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(400).json({ error: error.message });
      }
      res.status(400).json({ error: 'Unknown error' });
    }
  };

  const getCandidateById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid candidate ID' });
      }
      const candidate = await candidateService.findCandidateById(id);
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }
      res.status(200).json(candidate);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const updateCandidateStage = async (req: Request, res: Response) => {
    try {
      const candidateId = parseInt(req.params.id, 10);
      const { currentInterviewStep } = req.body;
      if (isNaN(candidateId) || candidateId <= 0 || typeof currentInterviewStep !== 'number') {
        return res.status(400).json({ error: 'Invalid parameters' });
      }
      // Llama al servicio para actualizar la etapa
      const result = await candidateService.updateCandidateStage(candidateId, currentInterviewStep);
      res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof Error) {
        if (
          error.message === 'Aplicación no encontrada para el candidato especificado.' ||
          error.message === 'Application not found for the specified candidate.' ||
          error.message.includes('no encontrada') ||
          error.message.includes('not found')
        ) {
          return res.status(404).json({ error: error.message });
        }
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  return {
    addCandidateController,
    getCandidateById,
    updateCandidateStage
  };
}

// Exportar controladores por defecto usando el servicio real
const { addCandidateController, getCandidateById, updateCandidateStage } = createCandidateControllers(realCandidateService);
export { addCandidateController, getCandidateById, updateCandidateStage };
export { realCandidateService as candidateService };