import { EventHandler, EventType, DomainEvent, CandidateCreatedEvent, CandidateStageChangedEvent, InterviewScheduledEvent, SecurityEvent } from './eventBus';
import { monitoringService } from './monitoringService';
import { analyticsService } from './analyticsService';
import { cacheService } from './cacheService';

// Notification service interface
interface NotificationService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendSMS(to: string, message: string): Promise<void>;
  sendPushNotification(userId: number, title: string, message: string): Promise<void>;
}

// Mock notification service (in production, integrate with real services)
class MockNotificationService implements NotificationService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log(`[NOTIFICATION] Email sent to ${to}: ${subject}`);
    // In production: integrate with SendGrid, AWS SES, etc.
  }

  async sendSMS(to: string, message: string): Promise<void> {
    console.log(`[NOTIFICATION] SMS sent to ${to}: ${message}`);
    // In production: integrate with Twilio, AWS SNS, etc.
  }

  async sendPushNotification(userId: number, title: string, message: string): Promise<void> {
    console.log(`[NOTIFICATION] Push notification sent to user ${userId}: ${title} - ${message}`);
    // In production: integrate with Firebase, OneSignal, etc.
  }
}

const notificationService = new MockNotificationService();

// Candidate Created Event Handler
export class CandidateCreatedEventHandler implements EventHandler<CandidateCreatedEvent> {
  async handle(event: CandidateCreatedEvent): Promise<void> {
    console.log(`[EVENT_HANDLER] Processing candidate created event: ${event.data.candidateId}`);

    try {
      // 1. Send welcome email to candidate
      await this.sendWelcomeEmail(event.data);

      // 2. Notify recruiters
      await this.notifyRecruiters(event.data);

      // 3. Update analytics
      await this.updateAnalytics(event);

      // 4. Invalidate related caches
      await this.invalidateCaches(event.data);

      // 5. Record business metric
      monitoringService.recordBusinessMetrics({
        type: 'candidate_created',
        data: {
          candidateId: event.data.candidateId,
          companyId: event.data.companyId,
          timestamp: event.timestamp
        },
        timestamp: event.timestamp,
        userId: event.metadata?.userId,
        companyId: event.data.companyId
      });

      console.log(`[EVENT_HANDLER] Candidate created event processed successfully: ${event.data.candidateId}`);
    } catch (error) {
      console.error(`[EVENT_HANDLER] Failed to process candidate created event: ${event.data.candidateId}`, error);
      throw error;
    }
  }

  private async sendWelcomeEmail(candidateData: CandidateCreatedEvent['data']): Promise<void> {
    const subject = 'Welcome to Our Recruitment Process';
    const body = `
      Dear ${candidateData.firstName} ${candidateData.lastName},
      
      Thank you for your interest in joining our team! We have received your application and are excited to review your profile.
      
      Our recruitment team will be in touch with you soon to discuss the next steps in the process.
      
      Best regards,
      The Recruitment Team
    `;

    await notificationService.sendEmail(candidateData.email, subject, body);
  }

  private async notifyRecruiters(candidateData: CandidateCreatedEvent['data']): Promise<void> {
    // In production, fetch recruiters for the company
    const subject = 'New Candidate Application';
    const body = `
      A new candidate has applied:
      
      Name: ${candidateData.firstName} ${candidateData.lastName}
      Email: ${candidateData.email}
      Company: ${candidateData.companyId}
      
      Please review their application and take appropriate action.
    `;

    // Send to recruiters (in production, fetch from database)
    await notificationService.sendEmail('recruiter@company.com', subject, body);
  }

  private async updateAnalytics(event: CandidateCreatedEvent): Promise<void> {
    // Update recruitment metrics
    const cacheKey = `recruitment_metrics:30d`;
    cacheService.delete(cacheKey);
    
    // Trigger analytics recalculation
    await analyticsService.getRecruitmentMetrics('30d');
  }

  private async invalidateCaches(candidateData: CandidateCreatedEvent['data']): Promise<void> {
    // Invalidate caches related to candidates
    cacheService.invalidatePattern('candidate:*');
    cacheService.invalidatePattern(`company:${candidateData.companyId}:candidates:*`);
  }
}

// Candidate Stage Changed Event Handler
export class CandidateStageChangedEventHandler implements EventHandler<CandidateStageChangedEvent> {
  async handle(event: CandidateStageChangedEvent): Promise<void> {
    console.log(`[EVENT_HANDLER] Processing candidate stage changed event: ${event.data.candidateId}`);

    try {
      // 1. Send notification to candidate
      await this.notifyCandidate(event.data);

      // 2. Update pipeline analytics
      await this.updatePipelineAnalytics(event);

      // 3. Trigger workflow automation
      await this.triggerWorkflow(event.data);

      // 4. Invalidate pipeline caches
      await this.invalidateCaches(event.data);

      // 5. Record business metric
      monitoringService.recordBusinessMetrics({
        type: 'candidate_updated',
        data: {
          candidateId: event.data.candidateId,
          positionId: event.data.positionId,
          oldStage: event.data.oldStage,
          newStage: event.data.newStage,
          changedBy: event.data.changedBy,
          timestamp: event.timestamp
        },
        timestamp: event.timestamp,
        userId: event.data.changedBy
      });

      console.log(`[EVENT_HANDLER] Candidate stage changed event processed successfully: ${event.data.candidateId}`);
    } catch (error) {
      console.error(`[EVENT_HANDLER] Failed to process candidate stage changed event: ${event.data.candidateId}`, error);
      throw error;
    }
  }

  private async notifyCandidate(stageData: CandidateStageChangedEvent['data']): Promise<void> {
    const stageMessages: Record<string, string> = {
      'Initial Review': 'Your application is under initial review.',
      'Phone Screen': 'We would like to schedule a phone interview.',
      'Technical Interview': 'You have been selected for a technical interview.',
      'Final Interview': 'Congratulations! You have been selected for the final interview.',
      'Offer': 'We are pleased to extend you an offer!',
      'Hired': 'Welcome to the team!'
    };

    const message = stageMessages[stageData.newStage] || `Your application has moved to the ${stageData.newStage} stage.`;

    // In production, fetch candidate email from database
    await notificationService.sendEmail('candidate@example.com', 'Application Update', message);
  }

  private async updatePipelineAnalytics(event: CandidateStageChangedEvent): Promise<void> {
    // Update pipeline analytics
    const cacheKey = `pipeline_analytics:${event.data.positionId}`;
    cacheService.delete(cacheKey);
    
    // Trigger analytics recalculation
    await analyticsService.getPipelineAnalytics(event.data.positionId);
  }

  private async triggerWorkflow(stageData: CandidateStageChangedEvent['data']): Promise<void> {
    // Trigger different workflows based on stage
    switch (stageData.newStage) {
      case 'Phone Screen':
        // Schedule phone interview
        console.log(`[WORKFLOW] Scheduling phone interview for candidate ${stageData.candidateId}`);
        break;
      case 'Technical Interview':
        // Send technical assessment
        console.log(`[WORKFLOW] Sending technical assessment to candidate ${stageData.candidateId}`);
        break;
      case 'Final Interview':
        // Schedule final interview
        console.log(`[WORKFLOW] Scheduling final interview for candidate ${stageData.candidateId}`);
        break;
      case 'Offer':
        // Generate offer letter
        console.log(`[WORKFLOW] Generating offer letter for candidate ${stageData.candidateId}`);
        break;
    }
  }

  private async invalidateCaches(stageData: CandidateStageChangedEvent['data']): Promise<void> {
    // Invalidate caches related to pipeline
    cacheService.invalidatePattern(`pipeline:*`);
    cacheService.invalidatePattern(`position:${stageData.positionId}:*`);
  }
}

// Interview Scheduled Event Handler
export class InterviewScheduledEventHandler implements EventHandler<InterviewScheduledEvent> {
  async handle(event: InterviewScheduledEvent): Promise<void> {
    console.log(`[EVENT_HANDLER] Processing interview scheduled event: ${event.data.interviewId}`);

    try {
      // 1. Send calendar invitation
      await this.sendCalendarInvitation(event.data);

      // 2. Notify interviewer
      await this.notifyInterviewer(event.data);

      // 3. Update interview analytics
      await this.updateInterviewAnalytics(event);

      // 4. Record business metric
      monitoringService.recordBusinessMetrics({
        type: 'interview_scheduled',
        data: {
          interviewId: event.data.interviewId,
          candidateId: event.data.candidateId,
          positionId: event.data.positionId,
          scheduledDate: event.data.scheduledDate,
          interviewerId: event.data.interviewerId,
          interviewType: event.data.interviewType,
          timestamp: event.timestamp
        },
        timestamp: event.timestamp,
        userId: event.data.interviewerId
      });

      console.log(`[EVENT_HANDLER] Interview scheduled event processed successfully: ${event.data.interviewId}`);
    } catch (error) {
      console.error(`[EVENT_HANDLER] Failed to process interview scheduled event: ${event.data.interviewId}`, error);
      throw error;
    }
  }

  private async sendCalendarInvitation(interviewData: InterviewScheduledEvent['data']): Promise<void> {
    // In production, integrate with calendar services (Google Calendar, Outlook, etc.)
    console.log(`[CALENDAR] Sending calendar invitation for interview ${interviewData.interviewId}`);
    
    // Send email with calendar attachment
    const subject = 'Interview Scheduled';
    const body = `
      Your interview has been scheduled:
      
      Date: ${interviewData.scheduledDate}
      Type: ${interviewData.interviewType}
      
      Please check your calendar for the invitation.
    `;

    // In production, fetch candidate email from database
    await notificationService.sendEmail('candidate@example.com', subject, body);
  }

  private async notifyInterviewer(interviewData: InterviewScheduledEvent['data']): Promise<void> {
    const subject = 'New Interview Assignment';
    const body = `
      You have been assigned a new interview:
      
      Interview ID: ${interviewData.interviewId}
      Candidate ID: ${interviewData.candidateId}
      Date: ${interviewData.scheduledDate}
      Type: ${interviewData.interviewType}
      
      Please prepare for the interview and review the candidate's profile.
    `;

    // In production, fetch interviewer email from database
    await notificationService.sendEmail('interviewer@company.com', subject, body);
  }

  private async updateInterviewAnalytics(event: InterviewScheduledEvent): Promise<void> {
    // Update interview analytics
    const cacheKey = `interview_analytics:${event.data.positionId}`;
    cacheService.delete(cacheKey);
  }
}

// Security Event Handler
export class SecurityEventHandler implements EventHandler<SecurityEvent> {
  async handle(event: SecurityEvent): Promise<void> {
    console.log(`[EVENT_HANDLER] Processing security event: ${event.data.eventType}`);

    try {
      // 1. Log security event
      await this.logSecurityEvent(event);

      // 2. Send alerts for high severity events
      if (event.data.severity === 'high' || event.data.severity === 'critical') {
        await this.sendSecurityAlert(event);
      }

      // 3. Update security analytics
      await this.updateSecurityAnalytics(event);

      // 4. Trigger automated responses
      await this.triggerAutomatedResponse(event);

      console.log(`[EVENT_HANDLER] Security event processed successfully: ${event.data.eventType}`);
    } catch (error) {
      console.error(`[EVENT_HANDLER] Failed to process security event: ${event.data.eventType}`, error);
      throw error;
    }
  }

  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    // Log to security monitoring system
    monitoringService.recordSecurityEvent({
      type: event.data.eventType as any,
      severity: event.data.severity,
      message: event.data.message,
      details: event.data,
      timestamp: event.timestamp,
      userId: event.data.userId,
      ip: event.data.ip,
      userAgent: event.data.userAgent,
      endpoint: event.data.endpoint
    });
  }

  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    const subject = `Security Alert: ${event.data.severity.toUpperCase()} - ${event.data.eventType}`;
    const body = `
      Security Event Detected:
      
      Type: ${event.data.eventType}
      Severity: ${event.data.severity}
      Message: ${event.data.message}
      User ID: ${event.data.userId || 'N/A'}
      IP: ${event.data.ip}
      User Agent: ${event.data.userAgent}
      Endpoint: ${event.data.endpoint || 'N/A'}
      Timestamp: ${event.timestamp}
      
      Please investigate immediately.
    `;

    // Send to security team
    await notificationService.sendEmail('security@company.com', subject, body);
    
    // Send SMS for critical events
    if (event.data.severity === 'critical') {
      await notificationService.sendSMS('+1234567890', `CRITICAL: ${event.data.message}`);
    }
  }

  private async updateSecurityAnalytics(event: SecurityEvent): Promise<void> {
    // Update security analytics
    const cacheKey = 'security_analytics';
    cacheService.delete(cacheKey);
  }

  private async triggerAutomatedResponse(event: SecurityEvent): Promise<void> {
    // Trigger automated security responses
    switch (event.data.eventType) {
      case 'brute_force_attempt':
        // Block IP address
        console.log(`[SECURITY] Blocking IP address: ${event.data.ip}`);
        break;
      case 'suspicious_activity':
        // Flag user account
        if (event.data.userId) {
          console.log(`[SECURITY] Flagging user account: ${event.data.userId}`);
        }
        break;
      case 'data_access_violation':
        // Revoke user access
        if (event.data.userId) {
          console.log(`[SECURITY] Revoking access for user: ${event.data.userId}`);
        }
        break;
    }
  }
}

// Event handler registry
export class EventHandlerRegistry {
  private static instance: EventHandlerRegistry;
  private handlers: Map<EventType, EventHandler[]> = new Map();

  static getInstance(): EventHandlerRegistry {
    if (!EventHandlerRegistry.instance) {
      EventHandlerRegistry.instance = new EventHandlerRegistry();
    }
    return EventHandlerRegistry.instance;
  }

  registerHandlers(): void {
    // Register all event handlers
    const candidateCreatedHandler = new CandidateCreatedEventHandler();
    const candidateStageChangedHandler = new CandidateStageChangedEventHandler();
    const interviewScheduledHandler = new InterviewScheduledEventHandler();
    const securityEventHandler = new SecurityEventHandler();

    // Register handlers with event bus
    const { eventBus } = require('./eventBus');
    
    eventBus.subscribe(EventType.CANDIDATE_CREATED, candidateCreatedHandler);
    eventBus.subscribe(EventType.CANDIDATE_STAGE_CHANGED, candidateStageChangedHandler);
    eventBus.subscribe(EventType.INTERVIEW_SCHEDULED, interviewScheduledHandler);
    eventBus.subscribe(EventType.SECURITY_EVENT, securityEventHandler);

    console.log('[EVENT_HANDLER_REGISTRY] All event handlers registered successfully');
  }
}

// Export singleton instance
export const eventHandlerRegistry = EventHandlerRegistry.getInstance();
