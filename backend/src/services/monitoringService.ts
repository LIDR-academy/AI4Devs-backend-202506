import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';

export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
  userId?: number;
  ip: string;
  userAgent: string;
  requestSize?: number;
  responseSize?: number;
}

export interface SecurityEvent {
  type: 'authentication' | 'authorization' | 'validation' | 'rate_limit' | 'suspicious_activity' | 'gateway_error' | 'pipeline_error' | 'pipeline_stage_update_error' | 'pipeline_interview_steps_error' | 'pipeline_analytics_error' | 'unhandled_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: any;
  timestamp: Date;
  userId?: number;
  ip: string;
  userAgent: string;
  endpoint?: string;
}

export interface BusinessMetrics {
  type: 'candidate_created' | 'candidate_updated' | 'interview_scheduled' | 'application_submitted' | 'pipeline_candidates_retrieved' | 'candidate_stage_updated' | 'interview_steps_retrieved' | 'pipeline_analytics_retrieved';
  data: any;
  timestamp: Date;
  userId?: number;
  companyId?: number;
}

export class MonitoringService extends EventEmitter {
  private static instance: MonitoringService;
  private logger!: winston.Logger;
  private metrics: PerformanceMetrics[] = [];
  private securityEvents: SecurityEvent[] = [];
  private businessMetrics: BusinessMetrics[] = [];
  private alertThresholds = {
    responseTime: 1000, // 1 second
    errorRate: 0.05, // 5%
    memoryUsage: 0.8 // 80%
  };

  private constructor() {
    super();
    this.setupLogger();
    this.startPeriodicCleanup();
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private setupLogger(): void {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'lti-backend' },
      transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }

  performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const startTime = performance.now();
    const monitoringService = this;
    const originalSend = res.send;
    res.send = function(data: any) {
      const metrics: PerformanceMetrics = {
        endpoint: req.path,
        method: req.method,
        responseTime: performance.now() - startTime,
        statusCode: res.statusCode,
        timestamp: new Date(),
        userId: (req as any).user?.id,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        requestSize: parseInt(req.headers['content-length'] || '0'),
        responseSize: typeof data === 'string' ? data.length : JSON.stringify(data).length
      };
      monitoringService.recordPerformanceMetrics(metrics);
      
      // Check for performance alerts
      if (metrics.responseTime > monitoringService.alertThresholds.responseTime) {
        monitoringService.emit('performance_alert', {
          type: 'slow_response',
          endpoint: metrics.endpoint,
          responseTime: metrics.responseTime,
          threshold: monitoringService.alertThresholds.responseTime
        });
      }
      
      return originalSend.call(this, data);
    };
    next();
  };

  recordPerformanceMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    
    this.logger.info('Performance metric recorded', metrics);
  }

  recordSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.push(event);
    
    // Keep only last 500 security events
    if (this.securityEvents.length > 500) {
      this.securityEvents = this.securityEvents.slice(-500);
    }
    
    this.logger.warn('Security event recorded', event);
    
    // Emit alert for high severity events
    if (event.severity === 'high' || event.severity === 'critical') {
      this.emit('security_alert', event);
    }
  }

  recordBusinessMetrics(metrics: BusinessMetrics): void {
    this.businessMetrics.push(metrics);
    
    // Keep only last 1000 business metrics
    if (this.businessMetrics.length > 1000) {
      this.businessMetrics = this.businessMetrics.slice(-1000);
    }
    
    this.logger.info('Business metric recorded', metrics);
  }

  getPerformanceAnalytics(timeRange: '7d' | '30d' | '90d' = '30d'): any {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));
    
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoff);
    
    if (recentMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        requestsPerSecond: 0,
        errorRate: 0,
        totalRequests: 0
      };
    }
    
    const totalRequests = recentMetrics.length;
    const averageResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
    const errorCount = recentMetrics.filter(m => m.statusCode >= 400).length;
    const errorRate = errorCount / totalRequests;
    
    // Calculate requests per second (approximate)
    const timeSpan = (Date.now() - cutoff.getTime()) / 1000;
    const requestsPerSecond = totalRequests / timeSpan;
    
    return {
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
      errorRate: Math.round(errorRate * 10000) / 100, // Percentage
      totalRequests,
      timeRange
    };
  }

  getSecurityAnalytics(timeRange: '7d' | '30d' | '90d' = '30d'): any {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));
    
    const recentEvents = this.securityEvents.filter(e => e.timestamp >= cutoff);
    
    const eventsByType = recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const eventsBySeverity = recentEvents.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalEvents: recentEvents.length,
      eventsByType,
      eventsBySeverity,
      timeRange
    };
  }

  getBusinessAnalytics(timeRange: '7d' | '30d' | '90d' = '30d'): any {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));
    
    const recentMetrics = this.businessMetrics.filter(m => m.timestamp >= cutoff);
    
    const metricsByType = recentMetrics.reduce((acc, metric) => {
      acc[metric.type] = (acc[metric.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalMetrics: recentMetrics.length,
      metricsByType,
      timeRange
    };
  }

  setAlertThresholds(thresholds: Partial<typeof this.alertThresholds>): void {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
  }

  private startPeriodicCleanup(): void {
    setInterval(() => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7); // Keep 7 days of data
      
      this.metrics = this.metrics.filter(m => m.timestamp >= cutoff);
      this.securityEvents = this.securityEvents.filter(e => e.timestamp >= cutoff);
      this.businessMetrics = this.businessMetrics.filter(m => m.timestamp >= cutoff);
      
      this.logger.info('Cleanup completed', {
        metricsCount: this.metrics.length,
        securityEventsCount: this.securityEvents.length,
        businessMetricsCount: this.businessMetrics.length
      });
    }, 24 * 60 * 60 * 1000); // Run daily
  }

  getHealthStatus(): any {
    return {
      status: 'healthy',
      metrics: {
        performance: this.metrics.length,
        security: this.securityEvents.length,
        business: this.businessMetrics.length
      },
      timestamp: new Date().toISOString()
    };
  }

  exportLogs(): any {
    return {
      performance: this.metrics,
      security: this.securityEvents,
      business: this.businessMetrics,
      exportedAt: new Date().toISOString()
    };
  }
}

export const monitoringService = MonitoringService.getInstance();
