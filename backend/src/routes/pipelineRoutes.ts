import { Router } from 'express';
import { PipelineController } from '../presentation/controllers/pipelineController';
import {
  candidatePipelineValidation,
  updateCandidateStageValidation,
  interviewStepsValidation
} from '../middleware/validationMiddleware';

const router = Router();

// GET /positions/:id/candidates - Get all candidates in pipeline for a position
router.get('/positions/:id/candidates', candidatePipelineValidation, PipelineController.getCandidatesForPosition);

// PUT /candidates/:id/stage - Update candidate stage in pipeline
router.put('/candidates/:id/stage', updateCandidateStageValidation, PipelineController.updateCandidateStage);

// GET /positions/:id/interview-steps - Get available interview steps for a position
router.get('/positions/:id/interview-steps', interviewStepsValidation, PipelineController.getInterviewStepsForPosition);

// GET /pipeline/analytics - Get pipeline analytics
router.get('/pipeline/analytics', PipelineController.getPipelineAnalytics);

export default router;
