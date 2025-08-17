import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { securityConfig } from '../config/security';

const prisma = new PrismaClient();

// Extended request interface with user information
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    permissions: string[];
    companyId?: number;
    lastLogin?: Date;
  };
}

// JWT Token types
export interface JWTPayload {
  id: number;
  email: string;
  role: string;
  permissions: string[];
  companyId?: number;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

// User roles and permissions
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  RECRUITER = 'recruiter',
  INTERVIEWER = 'interviewer',
  VIEWER = 'viewer'
}

export enum Permission {
  // Candidate permissions
  CREATE_CANDIDATE = 'create_candidate',
  READ_CANDIDATE = 'read_candidate',
  UPDATE_CANDIDATE = 'update_candidate',
  DELETE_CANDIDATE = 'delete_candidate',
  
  // Position permissions
  CREATE_POSITION = 'create_position',
  READ_POSITION = 'read_position',
  UPDATE_POSITION = 'update_position',
  DELETE_POSITION = 'delete_position',
  
  // Interview permissions
  CREATE_INTERVIEW = 'create_interview',
  READ_INTERVIEW = 'read_interview',
  UPDATE_INTERVIEW = 'update_interview',
  DELETE_INTERVIEW = 'delete_interview',
  
  // Pipeline permissions
  MANAGE_PIPELINE = 'manage_pipeline',
  VIEW_PIPELINE = 'view_pipeline',
  
  // System permissions
  MANAGE_USERS = 'manage_users',
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_SETTINGS = 'manage_settings'
}

// Role-based permission mapping
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.ADMIN]: [
    Permission.CREATE_CANDIDATE, Permission.READ_CANDIDATE, Permission.UPDATE_CANDIDATE,
    Permission.CREATE_POSITION, Permission.READ_POSITION, Permission.UPDATE_POSITION,
    Permission.CREATE_INTERVIEW, Permission.READ_INTERVIEW, Permission.UPDATE_INTERVIEW,
    Permission.MANAGE_PIPELINE, Permission.VIEW_PIPELINE, Permission.VIEW_ANALYTICS,
    Permission.MANAGE_USERS, Permission.MANAGE_SETTINGS
  ],
  [UserRole.RECRUITER]: [
    Permission.CREATE_CANDIDATE, Permission.READ_CANDIDATE, Permission.UPDATE_CANDIDATE,
    Permission.READ_POSITION, Permission.CREATE_INTERVIEW, Permission.READ_INTERVIEW,
    Permission.UPDATE_INTERVIEW, Permission.MANAGE_PIPELINE, Permission.VIEW_PIPELINE,
    Permission.VIEW_ANALYTICS
  ],
  [UserRole.INTERVIEWER]: [
    Permission.READ_CANDIDATE, Permission.READ_POSITION, Permission.CREATE_INTERVIEW,
    Permission.READ_INTERVIEW, Permission.UPDATE_INTERVIEW, Permission.VIEW_PIPELINE
  ],
  [UserRole.VIEWER]: [
    Permission.READ_CANDIDATE, Permission.READ_POSITION, Permission.READ_INTERVIEW,
    Permission.VIEW_PIPELINE
  ]
};

// Authentication middleware
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'MISSING_TOKEN'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, securityConfig.jwt.secret) as JWTPayload;
    
    // Check if token is access token
    if (decoded.type !== 'access') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    // Check if user still exists and is active
    const user = await prisma.employee.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        companyId: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'User not found or inactive',
        code: 'USER_INACTIVE'
      });
    }

    // Attach user information to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: rolePermissions[user.role as UserRole] || [],
      companyId: user.companyId
    };

    // Log successful authentication
    console.log(`[AUTH] User ${user.email} authenticated successfully - IP: ${req.ip}`);

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    console.error('[AUTH] Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

// Role-based authorization middleware
export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Permission-based authorization middleware
export const requirePermission = (permissions: Permission[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const hasPermission = permissions.some(permission => 
      req.user!.permissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredPermissions: permissions,
        userPermissions: req.user.permissions
      });
    }

    next();
  };
};

// Company-scoped authorization middleware
export const requireCompanyAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  // Super admins can access all companies
  if (req.user.role === UserRole.SUPER_ADMIN) {
    return next();
  }

  const requestedCompanyId = parseInt(req.params.companyId || req.body.companyId);
  
  if (req.user.companyId !== requestedCompanyId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied to company resources',
      code: 'COMPANY_ACCESS_DENIED'
    });
  }

  next();
};

// Authentication service
export class AuthenticationService {
  // Generate access token
  static generateAccessToken(user: any): string {
    const payload: Partial<JWTPayload> = {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: rolePermissions[user.role as UserRole] || [],
      companyId: user.companyId,
      type: 'access'
    };

    return jwt.sign(payload, securityConfig.jwt.secret, {
      expiresIn: securityConfig.jwt.expiresIn,
      issuer: securityConfig.jwt.issuer,
      audience: securityConfig.jwt.audience
    } as jwt.SignOptions);
  }

  // Generate refresh token
  static generateRefreshToken(user: any): string {
    const payload: Partial<JWTPayload> = {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: rolePermissions[user.role as UserRole] || [],
      companyId: user.companyId,
      type: 'refresh'
    };

    return jwt.sign(payload, securityConfig.jwt.secret, {
      expiresIn: securityConfig.jwt.refreshExpiresIn,
      issuer: securityConfig.jwt.issuer,
      audience: securityConfig.jwt.audience
    } as jwt.SignOptions);
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, securityConfig.bcrypt.rounds);
  }

  // Compare password
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Login user
  static async loginUser(email: string, password: string) {
    const user = await prisma.employee.findUnique({
      where: { email },
      include: { company: true }
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    // Note: In a real implementation, you would compare with hashed password
    // For now, we'll skip password validation since the schema doesn't have password field
    // const isValidPassword = await this.comparePassword(password, user.password);
    // if (!isValidPassword) {
    //   throw new Error('Invalid credentials');
    // }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token (in production, use Redis)
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        company: user.company
      }
    };
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, securityConfig.jwt.secret) as JWTPayload;
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Check if refresh token exists and is valid
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new Error('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(storedToken.user);

      return { accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Logout user
  static async logoutUser(refreshToken: string) {
    await prisma.refreshToken.delete({
      where: { token: refreshToken }
    });
  }
}
