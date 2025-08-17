import express from 'express';
import { PrismaClient } from '@prisma/client';
import candidateRoutes from './routes/candidateRoutes';
import pipelineRoutes from './routes/pipelineRoutes';
import { uploadFile } from './application/services/fileUploadService';
import { securityMiddleware } from './middleware/securityMiddleware';
import { monitoringService } from './services/monitoringService';
import { eventBus } from './services/eventBus';
import { eventHandlerRegistry } from './services/eventHandlers';
import { apiGateway } from './gateway/apiGateway';
import { redisCacheService } from './services/redisCacheService';

export const app = express();
export default app;

// Apply security middleware first
app.use(securityMiddleware);

// Middleware para parsear JSON. Asegúrate de que esto esté antes de tus rutas.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para adjuntar prisma al objeto de solicitud
app.use((req, res, next) => {
  (req as any).prisma = new PrismaClient();
  next();
});

// Apply monitoring middleware
app.use(monitoringService.performanceMiddleware);

// Initialize event-driven architecture
console.log('[APP] Initializing event-driven architecture...');
eventHandlerRegistry.registerHandlers();

// Initialize Redis cache service
console.log('[APP] Initializing Redis cache service...');
redisCacheService.on('connected', () => {
  console.log('[APP] Redis cache service connected successfully');
});

redisCacheService.on('error', (error) => {
  console.error('[APP] Redis cache service error:', error);
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const healthChecks = await Promise.allSettled([
      (req as any).prisma.$queryRaw`SELECT 1`,
      eventBus.healthCheck(),
      redisCacheService.healthCheck(),
      apiGateway.healthCheck()
    ]);

    const isHealthy = healthChecks.every(result => result.status === 'fulfilled');
    const status = isHealthy ? 'healthy' : 'unhealthy';

    res.json({
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: healthChecks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        eventBus: healthChecks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        redis: healthChecks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        apiGateway: healthChecks[3].status === 'fulfilled' ? 'healthy' : 'unhealthy'
      },
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    console.error('[APP] Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const [performanceMetrics, securityMetrics, cacheStats, eventStats] = await Promise.all([
      monitoringService.getPerformanceAnalytics(),
      monitoringService.getSecurityAnalytics(),
      redisCacheService.getStats(),
      eventBus.getQueueStats()
    ]);

    res.json({
      performance: performanceMetrics,
      security: securityMetrics,
      cache: cacheStats,
      events: eventStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[APP] Metrics collection failed:', error);
    res.status(500).json({
      error: 'Failed to collect metrics',
      timestamp: new Date().toISOString()
    });
  }
});

// API Gateway routes (for microservices architecture simulation)
app.use('/api/v1', apiGateway.gatewayMiddleware);

// Import and use candidateRoutes
app.use('/candidates', candidateRoutes);
app.use('/', pipelineRoutes);

// File upload endpoint
app.post('/upload', uploadFile);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[APP] Received SIGTERM, starting graceful shutdown...');
  
  try {
    // Close database connections
    await (app as any).prisma?.$disconnect();
    
    // Shutdown event bus
    await eventBus.shutdown();
    
    // Close Redis connections
    await redisCacheService.close();
    
    console.log('[APP] Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('[APP] Error during graceful shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('[APP] Received SIGINT, starting graceful shutdown...');
  
  try {
    // Close database connections
    await (app as any).prisma?.$disconnect();
    
    // Shutdown event bus
    await eventBus.shutdown();
    
    // Close Redis connections
    await redisCacheService.close();
    
    console.log('[APP] Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('[APP] Error during graceful shutdown:', error);
    process.exit(1);
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[APP] Unhandled error:', error);
  
  // Record error metric
  monitoringService.recordSecurityEvent({
    type: 'unhandled_error',
    severity: 'high',
    message: error.message,
    details: { stack: error.stack },
    timestamp: new Date(),
    userId: (req as any).user?.id,
    ip: req.ip || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    endpoint: req.path
  });

  res.status(500).json({
    success: false,
    error: {
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    }
  });
});

console.log('[APP] Application initialized successfully');
