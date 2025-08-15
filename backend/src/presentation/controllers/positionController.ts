import { Request, Response } from 'express';
import { getCandidatesByPosition, updateCandidateStage, getAllInterviewSteps } from '../../application/services/positionService';

export const getCandidatesByPositionController = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        if (isNaN(positionId)) {
            return res.status(400).json({ error: 'Invalid position ID format' });
        }

        const candidates = await getCandidatesByPosition(positionId, req.prisma);
        res.json({
            success: true,
            data: candidates,
            count: candidates.length
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ 
                success: false, 
                error: 'Error al recuperar los candidatos',
                message: error.message 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: 'Error interno del servidor' 
            });
        }
    }
};

export const getAllInterviewStepsController = async (req: Request, res: Response) => {
    try {
        const interviewSteps = await getAllInterviewSteps(req.prisma);
        res.json({
            success: true,
            data: interviewSteps,
            count: interviewSteps.length
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ 
                success: false, 
                error: 'Error al recuperar las etapas de entrevista',
                message: error.message 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: 'Error interno del servidor' 
            });
        }
    }
};

export const updateCandidateStageController = async (req: Request, res: Response) => {
    try {
        const candidateId = parseInt(req.params.id);
        if (isNaN(candidateId)) {
            return res.status(400).json({ error: 'Invalid candidate ID format' });
        }

        const { stageId } = req.body;
        if (!stageId || isNaN(parseInt(stageId))) {
            return res.status(400).json({ error: 'Invalid stage ID format' });
        }

        const updatedApplication = await updateCandidateStage(candidateId, parseInt(stageId), req.prisma);
        res.json({
            success: true,
            message: 'Etapa del candidato actualizada exitosamente',
            data: updatedApplication
        });
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ 
                success: false, 
                error: 'Error al actualizar la etapa del candidato',
                message: error.message 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: 'Error interno del servidor' 
            });
        }
    }
};
