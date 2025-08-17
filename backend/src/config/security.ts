// Security Configuration - Industry Best Practices
export const securityConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    expiresIn: '24h',
    refreshExpiresIn: '7d',
    issuer: 'LTI-API',
    audience: 'LTI-Users'
  },

  // Password Hashing
  bcrypt: {
    rounds: 12, // Industry standard for bcrypt rounds
    saltRounds: 10
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'another-super-secret-key-change-in-production',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      domain: process.env.COOKIE_DOMAIN || undefined
    },
    resave: false,
    saveUninitialized: false
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      errors: ['Rate limit exceeded']
    },
    standardHeaders: true,
    legacyHeaders: false
  },

  // Authentication Rate Limiting
  authRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 authentication attempts per windowMs
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again later.',
      errors: ['Authentication rate limit exceeded']
    }
  },

  // CORS Configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400 // 24 hours
  },

  // Request Size Limits
  requestLimits: {
    json: '10mb',
    urlencoded: '10mb',
    fileUpload: 5 * 1024 * 1024 // 5MB
  },

  // Security Headers
  headers: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    }
  },

  // Database Security
  database: {
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    charset: 'utf8mb4'
  },

  // Encryption Configuration
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    saltLength: 16
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    timestamp: true,
    securityEvents: true,
    performanceMetrics: true
  },

  // Environment-specific settings
  environment: {
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test'
  },

  // API Security
  api: {
    version: 'v1',
    prefix: '/api',
    timeout: 30000, // 30 seconds
    maxRetries: 3
  },

  // File Upload Security
  fileUpload: {
    allowedTypes: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    maxSize: 5 * 1024 * 1024, // 5MB
    uploadDir: 'uploads/',
    tempDir: 'temp/',
    scanForViruses: true
  },

  // Input Validation
  validation: {
    maxStringLength: 1000,
    maxArrayLength: 100,
    maxObjectDepth: 10,
    allowedFileExtensions: ['.pdf', '.docx'],
    sanitizeInputs: true
  },

  // Monitoring and Alerting
  monitoring: {
    enabled: true,
    metrics: {
      responseTime: true,
      errorRate: true,
      throughput: true,
      memoryUsage: true,
      cpuUsage: true
    },
    alerts: {
      errorThreshold: 0.05, // 5% error rate
      responseTimeThreshold: 5000, // 5 seconds
      memoryThreshold: 0.9 // 90% memory usage
    }
  }
};

// Environment-specific overrides
if (securityConfig.environment.isProduction) {
  securityConfig.session.cookie.secure = true;
  securityConfig.session.cookie.sameSite = 'strict';
  securityConfig.logging.level = 'warn';
  securityConfig.monitoring.enabled = true;
}

if (securityConfig.environment.isDevelopment) {
  securityConfig.logging.level = 'debug';
  securityConfig.monitoring.enabled = false;
}

if (securityConfig.environment.isTest) {
  securityConfig.rateLimit.max = 1000; // Higher limit for testing
  securityConfig.authRateLimit.max = 50; // Higher limit for testing
  securityConfig.logging.level = 'error';
}

// Export individual configurations for specific use cases
export const jwtConfig = securityConfig.jwt;
export const corsConfig = securityConfig.cors;
export const rateLimitConfig = securityConfig.rateLimit;
export const fileUploadConfig = securityConfig.fileUpload;
export const validationConfig = securityConfig.validation;
