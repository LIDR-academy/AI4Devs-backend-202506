import { Request, Response } from 'express';
import { PipelineService } from '../../application/services/pipelineService';
import { eventBus, EventFactory, EventType, CandidateStageChangedEvent } from '../../services/eventBus';
import { monitoringService } from '../../services/monitoringService';
import { cacheService } from '../../services/cacheService';

export class PipelineController {
  // GET /positions/:id/candidates - Get all candidates in pipeline for a position
  static async getCandidatesForPosition(req: Request, res: Response) {
    try {
      const positionId = parseInt(req.params.id);
      const cacheKey = `pipeline:position:${positionId}:candidates`;

      // Try to get from cache first
      let candidates = await cacheService.get<any[]>(cacheKey);
      
      if (!candidates) {
        // If not in cache, fetch from service
        candidates = await PipelineService.getCandidatesForPosition(positionId);
        
        // Cache the result for 5 minutes
        await cacheService.set(cacheKey, candidates, 300000);
      }

      // Record business metric
      monitoringService.recordBusinessMetrics({
        type: 'pipeline_candidates_retrieved',
        data: {
          positionId,
          candidateCount: candidates?.length || 0,
          timestamp: new Date()
        },
        timestamp: new Date(),
        userId: (req as any).user?.id
      });

      res.json({
        success: true,
        data: candidates,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[PIPELINE_CONTROLLER] Error getting candidates for position:', error);
      
      // Record error metric
      monitoringService.recordSecurityEvent({
        type: 'pipeline_error',
        severity: 'medium',
        message: `Failed to get candidates for position ${req.params.id}`,
        details: { error: (error as Error).message, positionId: req.params.id },
        timestamp: new Date(),
        userId: (req as any).user?.id,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        endpoint: req.path
      });

      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve candidates for position',
          details: (error as Error).message
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // PUT /candidates/:id/stage - Update candidate stage in pipeline
  static async updateCandidateStage(req: Request, res: Response) {
    try {
      const candidateId = parseInt(req.params.id);
      const { newStage, positionId } = req.body;

      // Get current stage for comparison
      const currentCandidate = await PipelineService.getCandidateById(candidateId);
      const oldStage = currentCandidate?.currentInterviewStep || 'Unknown';

      // Update the candidate stage
      const updatedCandidate = await PipelineService.updateCandidateStage(candidateId, newStage);

      // Invalidate related caches
      await cacheService.invalidatePattern(`pipeline:position:${positionId}:*`);
      await cacheService.invalidatePattern(`candidate:${candidateId}:*`);

      // Emit candidate stage changed event
      const stageChangedEvent = EventFactory.createEvent<CandidateStageChangedEvent>(
        EventType.CANDIDATE_STAGE_CHANGED,
        {
          candidateId,
          positionId,
          oldStage: oldStage.toString(),
          newStage,
          changedBy: (req as any).user?.id || 0
        },
        {
          userId: (req as any).user?.id,
          companyId: (req as any).user?.companyId,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          correlationId: req.headers['x-correlation-id'] as string
        }
      );

      await eventBus.publish(stageChangedEvent);

      // Record business metric
      monitoringService.recordBusinessMetrics({
        type: 'candidate_stage_updated',
        data: {
          candidateId,
          positionId,
          oldStage,
          newStage,
          changedBy: (req as any).user?.id,
          timestamp: new Date()
        },
        timestamp: new Date(),
        userId: (req as any).user?.id
      });

      res.json({
        success: true,
        data: {
          candidate: updatedCandidate,
          stageChanged: {
            from: oldStage,
            to: newStage,
            timestamp: new Date().toISOString()
          }
        },
        message: `Candidate stage updated from ${oldStage} to ${newStage}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[PIPELINE_CONTROLLER] Error updating candidate stage:', error);
      
      // Record error metric
      monitoringService.recordSecurityEvent({
        type: 'pipeline_stage_update_error',
        severity: 'medium',
        message: `Failed to update candidate ${req.params.id} stage`,
        details: { error: (error as Error).message, candidateId: req.params.id, newStage: req.body.newStage },
        timestamp: new Date(),
        userId: (req as any).user?.id,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        endpoint: req.path
      });

      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update candidate stage',
          details: (error as Error).message
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /positions/:id/interview-steps - Get available interview steps for a position
  static async getInterviewStepsForPosition(req: Request, res: Response) {
    try {
      const positionId = parseInt(req.params.id);
      const cacheKey = `pipeline:position:${positionId}:interview-steps`;

      // Try to get from cache first
      let interviewSteps = await cacheService.get<any[]>(cacheKey);
      
      if (!interviewSteps) {
        // If not in cache, fetch from service
        interviewSteps = await PipelineService.getInterviewStepsForPosition(positionId);
        
        // Cache the result for 10 minutes
        await cacheService.set(cacheKey, interviewSteps, 600000);
      }

      // Record business metric
      monitoringService.recordBusinessMetrics({
        type: 'interview_steps_retrieved',
        data: {
          positionId,
          stepsCount: interviewSteps?.length || 0,
          timestamp: new Date()
        },
        timestamp: new Date(),
        userId: (req as any).user?.id
      });

      res.json({
        success: true,
        data: interviewSteps,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[PIPELINE_CONTROLLER] Error getting interview steps for position:', error);
      
      // Record error metric
      monitoringService.recordSecurityEvent({
        type: 'pipeline_interview_steps_error',
        severity: 'low',
        message: `Failed to get interview steps for position ${req.params.id}`,
        details: { error: (error as Error).message, positionId: req.params.id },
        timestamp: new Date(),
        userId: (req as any).user?.id,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        endpoint: req.path
      });

      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve interview steps for position',
          details: (error as Error).message
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  // GET /pipeline/analytics - Get pipeline analytics
  static async getPipelineAnalytics(req: Request, res: Response) {
    try {
      const { positionId, timeRange = '30d' } = req.query;
      const cacheKey = `pipeline:analytics:${positionId}:${timeRange}`;

      // Try to get from cache first
      let analytics = await cacheService.get<any>(cacheKey);
      
      if (!analytics) {
        // If not in cache, fetch from service
        analytics = await PipelineService.getPipelineAnalytics(
          positionId ? parseInt(positionId as string) : undefined,
          timeRange as string
        );
        
        // Cache the result for 5 minutes
        await cacheService.set(cacheKey, analytics, 300000);
      }

      // Record business metric
      monitoringService.recordBusinessMetrics({
        type: 'pipeline_analytics_retrieved',
        data: {
          positionId: positionId ? parseInt(positionId as string) : null,
          timeRange,
          timestamp: new Date()
        },
        timestamp: new Date(),
        userId: (req as any).user?.id
      });

      res.json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[PIPELINE_CONTROLLER] Error getting pipeline analytics:', error);
      
      // Record error metric
      monitoringService.recordSecurityEvent({
        type: 'pipeline_analytics_error',
        severity: 'low',
        message: 'Failed to get pipeline analytics',
        details: { error: (error as Error).message, query: req.query },
        timestamp: new Date(),
        userId: (req as any).user?.id,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        endpoint: req.path
      });

      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to retrieve pipeline analytics',
          details: (error as Error).message
        },
        timestamp: new Date().toISOString()
      });
    }
  }
}
