import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { verifyAccessToken, JWTPayload } from '../utils/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Express Request to include user info
export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: UserRole;
  user?: {
    id: string;
    email: string;
    role: UserRole;
    departmentId: string | null;
    programId: string | null;
  };
}

/**
 * JWT Authentication middleware
 * Validates JWT token and attaches user info to request
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const payload = verifyAccessToken(token);

      // Fetch user from database to ensure they still exist and are active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          departmentId: true,
          programId: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          error: {
            code: 'ACCOUNT_DISABLED',
            message: 'Account is disabled',
          },
        });
      }

      // Attach user info to request
      req.userId = user.id;
      req.userEmail = user.email;
      req.userRole = user.role;
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId,
        programId: user.programId,
      };

      next();
    } catch (error) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token',
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to require specific role(s)
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        },
      });
    }

    next();
  };
};

/**
 * RBAC permission checker
 * Checks if user has permission to perform action on resource
 */
export const requirePermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    // SUPER_ADMIN has all permissions
    if (req.userRole === UserRole.SUPER_ADMIN) {
      return next();
    }

    // Check permission based on role and action
    const hasPermission = checkPermission(req.userRole, permission, req);

    if (!hasPermission) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Permission denied: ${permission}`,
        },
      });
    }

    next();
  };
};

/**
 * Permission checking logic
 * Maps roles to permissions
 */
function checkPermission(role: UserRole, permission: string, req: AuthRequest): boolean {
  // Permission format: resource:action
  // e.g., "request:create", "request:view_all", "user:manage"

  const [resource, action] = permission.split(':');

  // Role-based permission matrix
  const permissions: Record<UserRole, string[]> = {
    [UserRole.STUDENT]: [
      'request:create',
      'request:view_own',
      'request:update_own',
      'comment:create_own',
    ],
    [UserRole.ADVISOR]: [
      'request:view_all',
      'request:assign',
      'request:approve',
      'request:reject',
      'request:request_info',
      'comment:create',
      'document:verify',
    ],
    [UserRole.PROFESSOR]: [
      'request:view_all',
      'request:approve',
      'request:reject',
      'request:request_info',
      'comment:create',
      'document:verify',
    ],
    [UserRole.DEPT_ADMIN]: [
      'request:view_all',
      'request:assign',
      'request:approve',
      'request:reject',
      'request:request_info',
      'request:escalate',
      'comment:create',
      'document:verify',
      'user:view_department',
    ],
    [UserRole.DEAN]: [
      'request:view_all',
      'request:approve',
      'request:reject',
      'request:request_info',
      'request:escalate',
      'comment:create',
      'document:verify',
      'user:view_all',
      'analytics:view',
    ],
    [UserRole.SUPER_ADMIN]: [
      '*', // All permissions
    ],
  };

  const rolePermissions = permissions[role] || [];

  // Check if user has the permission
  if (rolePermissions.includes('*') || rolePermissions.includes(permission)) {
    return true;
  }

  // Special case: students can only view/edit their own requests
  if (role === UserRole.STUDENT && resource === 'request') {
    if (action === 'view_own' || action === 'update_own') {
      // Additional check: ensure user owns the resource
      const requestId = req.params.id || req.body.requestId;
      if (requestId && req.userId) {
        // This will be checked in the route handler
        return true;
      }
    }
  }

  return false;
}
