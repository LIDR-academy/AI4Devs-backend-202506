import { Request, Response } from 'express';
import { updateCandidateStage, getCandidateCurrentStage } from '../../application/services/candidateStageService';

export const updateCandidateStageController = async (req: Request, res: Response) => {
    try {
        const candidateId = parseInt(req.params.id);

        // Validar que el ID es un número válido
        if (isNaN(candidateId)) {
            return res.status(400).json({
                error: 'Invalid candidate ID format',
                message: 'Candidate ID must be a valid number'
            });
        }

        const stageData = req.body;

        // Validar que se proporcionan datos en el body
        if (!stageData || Object.keys(stageData).length === 0) {
            return res.status(400).json({
                error: 'Missing request body',
                message: 'Request body is required with interviewStepId'
            });
        }

        const updatedStage = await updateCandidateStage(candidateId, stageData);

        res.status(200).json({
            message: 'Candidate stage updated successfully',
            data: updatedStage
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Candidate not found') {
                return res.status(404).json({
                    error: 'Candidate not found',
                    message: 'The specified candidate does not exist'
                });
            }
            if (error.message === 'Interview step not found') {
                return res.status(404).json({
                    error: 'Interview step not found',
                    message: 'The specified interview step does not exist'
                });
            }
            if (error.message === 'No active application found for this candidate') {
                return res.status(404).json({
                    error: 'No active application',
                    message: 'This candidate has no active application'
                });
            }
            if (error.message.includes('Invalid')) {
                return res.status(400).json({
                    error: 'Validation error',
                    message: error.message
                });
            }
            return res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        } else {
            return res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred'
            });
        }
    }
};

export const getCandidateCurrentStageController = async (req: Request, res: Response) => {
    try {
        const candidateId = parseInt(req.params.id);

        // Validar que el ID es un número válido
        if (isNaN(candidateId)) {
            return res.status(400).json({
                error: 'Invalid candidate ID format',
                message: 'Candidate ID must be a valid number'
            });
        }

        const currentStage = await getCandidateCurrentStage(candidateId);

        res.status(200).json({
            message: 'Candidate current stage retrieved successfully',
            data: currentStage
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Candidate not found') {
                return res.status(404).json({
                    error: 'Candidate not found',
                    message: 'The specified candidate does not exist'
                });
            }
            if (error.message === 'No active application found for this candidate') {
                return res.status(404).json({
                    error: 'No active application',
                    message: 'This candidate has no active application'
                });
            }
            return res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        } else {
            return res.status(500).json({
                error: 'Internal server error',
                message: 'An unexpected error occurred'
            });
        }
    }
}; 