import { Request, Response, NextFunction } from 'express';
import { EventEmitter } from 'events';
import { eventBus, EventFactory, EventType } from '../services/eventBus';
import { monitoringService } from '../services/monitoringService';
import { cacheService } from '../services/cacheService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authenticationMiddleware';

// Service routing configuration
interface ServiceRoute {
  path: string;
  method: string;
  service: string;
  requiresAuth: boolean;
  rateLimit?: number;
  cache?: {
    enabled: boolean;
    ttl: number;
    key?: string;
  };
}

// API Gateway implementation
export class ApiGateway extends EventEmitter {
  private static instance: ApiGateway;
  private routes: Map<string, ServiceRoute> = new Map();
  private serviceEndpoints: Map<string, string> = new Map();

  private constructor() {
    super();
    this.initializeRoutes();
    this.initializeServiceEndpoints();
  }

  static getInstance(): ApiGateway {
    if (!ApiGateway.instance) {
      ApiGateway.instance = new ApiGateway();
    }
    return ApiGateway.instance;
  }

  private initializeRoutes(): void {
    // Candidate routes
    this.addRoute({
      path: '/candidates',
      method: 'POST',
      service: 'candidate-service',
      requiresAuth: true,
      rateLimit: 10,
      cache: { enabled: false, ttl: 0 }
    });

    this.addRoute({
      path: '/candidates/:id',
      method: 'GET',
      service: 'candidate-service',
      requiresAuth: true,
      rateLimit: 100,
      cache: { enabled: true, ttl: 300000, key: 'candidate:{id}' }
    });

    this.addRoute({
      path: '/candidates/:id',
      method: 'PUT',
      service: 'candidate-service',
      requiresAuth: true,
      rateLimit: 20,
      cache: { enabled: false, ttl: 0 }
    });

    // Pipeline routes
    this.addRoute({
      path: '/positions/:id/candidates',
      method: 'GET',
      service: 'pipeline-service',
      requiresAuth: true,
      rateLimit: 50,
      cache: { enabled: true, ttl: 60000, key: 'pipeline:position:{id}:candidates' }
    });

    this.addRoute({
      path: '/candidates/:id/stage',
      method: 'PUT',
      service: 'pipeline-service',
      requiresAuth: true,
      rateLimit: 30,
      cache: { enabled: false, ttl: 0 }
    });

    // Analytics routes
    this.addRoute({
      path: '/analytics/recruitment',
      method: 'GET',
      service: 'analytics-service',
      requiresAuth: true,
      rateLimit: 20,
      cache: { enabled: true, ttl: 300000, key: 'analytics:recruitment:{timeRange}' }
    });

    this.addRoute({
      path: '/analytics/pipeline',
      method: 'GET',
      service: 'analytics-service',
      requiresAuth: true,
      rateLimit: 20,
      cache: { enabled: true, ttl: 300000, key: 'analytics:pipeline:{positionId}' }
    });

    // Health check routes
    this.addRoute({
      path: '/health',
      method: 'GET',
      service: 'health-service',
      requiresAuth: false,
      rateLimit: 1000,
      cache: { enabled: true, ttl: 30000, key: 'health:status' }
    });

    // Metrics routes
    this.addRoute({
      path: '/metrics',
      method: 'GET',
      service: 'monitoring-service',
      requiresAuth: true,
      rateLimit: 10,
      cache: { enabled: true, ttl: 60000, key: 'metrics:system' }
    });
  }

  private initializeServiceEndpoints(): void {
    // In a microservices architecture, these would be service discovery endpoints
    this.serviceEndpoints.set('candidate-service', 'http://localhost:3001');
    this.serviceEndpoints.set('pipeline-service', 'http://localhost:3002');
    this.serviceEndpoints.set('analytics-service', 'http://localhost:3003');
    this.serviceEndpoints.set('health-service', 'http://localhost:3004');
    this.serviceEndpoints.set('monitoring-service', 'http://localhost:3005');
  }

  private addRoute(route: ServiceRoute): void {
    const key = `${route.method}:${route.path}`;
    this.routes.set(key, route);
  }

  // Main gateway middleware
  gatewayMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      // 1. Request logging
      this.logRequest(req, requestId);

      // 2. Route matching
      const route = this.matchRoute(req);
      if (!route) {
        return this.sendErrorResponse(res, 404, 'Route not found', requestId);
      }

      // 3. Authentication
      if (route.requiresAuth) {
        const authResult = await this.authenticateRequest(req);
        if (!authResult.success) {
          return this.sendErrorResponse(res, 401, authResult.message || 'Authentication failed', requestId);
        }
      }

      // 4. Rate limiting
      const rateLimitResult = await this.checkRateLimit(req, route);
      if (!rateLimitResult.allowed) {
        return this.sendErrorResponse(res, 429, 'Rate limit exceeded', requestId);
      }

      // 5. Cache check
      if (route.cache?.enabled) {
        const cachedResponse = await this.getCachedResponse(req, route);
        if (cachedResponse) {
          return this.sendCachedResponse(res, cachedResponse, requestId);
        }
      }

      // 6. Request transformation
      const transformedRequest = this.transformRequest(req, route);

      // 7. Service routing
      const serviceResponse = await this.routeToService(transformedRequest, route);

      // 8. Response transformation
      const transformedResponse = this.transformResponse(serviceResponse, route);

      // 9. Cache response
      if (route.cache?.enabled) {
        await this.cacheResponse(req, transformedResponse, route);
      }

      // 10. Send response
      this.sendResponse(res, transformedResponse, requestId);

      // 11. Log response
      this.logResponse(req, res, startTime, requestId);

      // 12. Emit events
      this.emitGatewayEvent('request_processed', {
        requestId,
        path: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseTime: Date.now() - startTime
      });

    } catch (error) {
      console.error(`[API_GATEWAY] Error processing request: ${requestId}`, error);
      
      // Log error
      this.logError(req, error as Error, requestId);
      
      // Send error response
      this.sendErrorResponse(res, 500, 'Internal server error', requestId);
      
      // Emit error event
      this.emitGatewayEvent('request_error', {
        requestId,
        path: req.path,
        method: req.method,
        error: (error as Error).message
      });
    }
  };

  private matchRoute(req: Request): ServiceRoute | null {
    const key = `${req.method}:${req.path}`;
    return this.routes.get(key) || null;
  }

  private async authenticateRequest(req: Request): Promise<{ success: boolean; message?: string }> {
    try {
      // Use the existing authentication middleware
      await new Promise<void>((resolve, reject) => {
        authenticateToken(req as AuthenticatedRequest, {} as Response, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Authentication failed' };
    }
  }

  private async checkRateLimit(req: Request, route: ServiceRoute): Promise<{ allowed: boolean }> {
    if (!route.rateLimit) {
      return { allowed: true };
    }

    const clientId = (req as AuthenticatedRequest).user?.id || req.ip;
    const key = `rate_limit:${clientId}:${req.method}:${req.path}`;
    
    const currentCount = await cacheService.get<number>(key) || 0;
    
    if (currentCount >= route.rateLimit) {
      return { allowed: false };
    }

    await cacheService.set(key, currentCount + 1, 60000); // 1 minute window
    return { allowed: true };
  }

  private async getCachedResponse(req: Request, route: ServiceRoute): Promise<any> {
    if (!route.cache?.key) return null;

    const cacheKey = this.buildCacheKey(route.cache.key, req);
    return cacheService.get(cacheKey);
  }

  private async cacheResponse(req: Request, response: any, route: ServiceRoute): Promise<void> {
    if (!route.cache?.key) return;

    const cacheKey = this.buildCacheKey(route.cache.key, req);
    await cacheService.set(cacheKey, response, route.cache.ttl);
  }

  private buildCacheKey(keyTemplate: string, req: Request): string {
    return keyTemplate
      .replace('{id}', req.params.id || '')
      .replace('{timeRange}', req.query.timeRange as string || '30d')
      .replace('{positionId}', req.params.id || '');
  }

  private transformRequest(req: Request, route: ServiceRoute): any {
    return {
      method: req.method,
      path: req.path,
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
      user: (req as AuthenticatedRequest).user,
      timestamp: new Date(),
      requestId: this.generateRequestId()
    };
  }

  private async routeToService(request: any, route: ServiceRoute): Promise<any> {
    const serviceEndpoint = this.serviceEndpoints.get(route.service);
    if (!serviceEndpoint) {
      throw new Error(`Service endpoint not found: ${route.service}`);
    }

    // In a real implementation, this would make HTTP requests to microservices
    // For now, we'll simulate the routing
    console.log(`[API_GATEWAY] Routing to service: ${route.service} at ${serviceEndpoint}`);
    
    // Simulate service response
    return {
      success: true,
      data: { message: `Response from ${route.service}` },
      timestamp: new Date()
    };
  }

  private transformResponse(serviceResponse: any, route: ServiceRoute): any {
    return {
      success: serviceResponse.success,
      data: serviceResponse.data,
      timestamp: serviceResponse.timestamp,
      service: route.service
    };
  }

  private sendResponse(res: Response, data: any, requestId: string): void {
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('X-Service', data.service);
    res.json(data);
  }

  private sendCachedResponse(res: Response, data: any, requestId: string): void {
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('X-Cache', 'HIT');
    res.json(data);
  }

  private sendErrorResponse(res: Response, statusCode: number, message: string, requestId: string): void {
    res.setHeader('X-Request-ID', requestId);
    res.status(statusCode).json({
      success: false,
      error: {
        code: statusCode,
        message,
        requestId
      },
      timestamp: new Date()
    });
  }

  private logRequest(req: Request, requestId: string): void {
    console.log(`[API_GATEWAY] Request: ${requestId} - ${req.method} ${req.path}`);
    
    // Record request metric
    monitoringService.recordPerformanceMetrics({
      endpoint: req.path,
      method: req.method,
      responseTime: 0, // Will be updated in logResponse
      statusCode: 0, // Will be updated in logResponse
      timestamp: new Date(),
      userId: (req as AuthenticatedRequest).user?.id,
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    });
  }

  private logResponse(req: Request, res: Response, startTime: number, requestId: string): void {
    const responseTime = Date.now() - startTime;
    console.log(`[API_GATEWAY] Response: ${requestId} - ${res.statusCode} (${responseTime}ms)`);
  }

  private logError(req: Request, error: Error, requestId: string): void {
    console.error(`[API_GATEWAY] Error: ${requestId} - ${error.message}`);
    
    // Record error metric
    monitoringService.recordSecurityEvent({
      type: 'gateway_error',
      severity: 'medium',
      message: error.message,
      details: { requestId, path: req.path, method: req.method },
      timestamp: new Date(),
      userId: (req as AuthenticatedRequest).user?.id,
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      endpoint: req.path
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private emitGatewayEvent(eventType: string, data: any): void {
    const event = EventFactory.createEvent(EventType.SECURITY_EVENT, {
      eventType: `gateway_${eventType}`,
      severity: 'low',
      message: `Gateway event: ${eventType}`,
      userId: data.userId,
      ip: data.ip || 'unknown',
      userAgent: data.userAgent || 'unknown',
      endpoint: data.path
    });

    eventBus.publish(event);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; services: Record<string, boolean> }> {
    const services: Record<string, boolean> = {};
    
    for (const [serviceName, endpoint] of Array.from(this.serviceEndpoints.entries())) {
      try {
        // In production, make actual health check requests
        services[serviceName] = true;
      } catch (error) {
        services[serviceName] = false;
      }
    }

    return {
      status: 'healthy',
      services
    };
  }

  // Get gateway statistics
  async getStats(): Promise<any> {
    return {
      routes: Array.from(this.routes.keys()),
      services: Array.from(this.serviceEndpoints.keys()),
      timestamp: new Date()
    };
  }
}

// Export singleton instance
export const apiGateway = ApiGateway.getInstance();
