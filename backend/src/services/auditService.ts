import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Audit Service - Logs all actions on requests
 * Creates audit log entries for tracking request lifecycle
 */
export class AuditService {
  /**
   * Log a request creation
   */
  static async logRequestCreated(requestId: string, actorId: string): Promise<void> {
    await prisma.auditLog.create({
      data: {
        requestId,
        actorId,
        action: 'REQUEST_CREATED',
        meta: {},
        prevHash: null, // Will be set in Phase 10
        hash: null, // Will be set in Phase 10
      },
    });
  }

  /**
   * Log a status change
   */
  static async logStatusChange(
    requestId: string,
    actorId: string,
    fromStatus: string,
    toStatus: string
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        requestId,
        actorId,
        action: 'STATUS_CHANGED',
        meta: {
          from: fromStatus,
          to: toStatus,
        },
        prevHash: null, // Will be set in Phase 10
        hash: null, // Will be set in Phase 10
      },
    });
  }

  /**
   * Log a comment addition
   */
  static async logCommentAdded(requestId: string, actorId: string, commentId: string): Promise<void> {
    await prisma.auditLog.create({
      data: {
        requestId,
        actorId,
        action: 'COMMENT_ADDED',
        meta: {
          commentId,
        },
        prevHash: null, // Will be set in Phase 10
        hash: null, // Will be set in Phase 10
      },
    });
  }

  /**
   * Log assignment change
   */
  static async logAssignmentChange(
    requestId: string,
    actorId: string,
    assignedToId: string | null
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        requestId,
        actorId,
        action: 'ASSIGNMENT_CHANGED',
        meta: {
          assignedToId,
        },
        prevHash: null, // Will be set in Phase 10
        hash: null, // Will be set in Phase 10
      },
    });
  }
}
