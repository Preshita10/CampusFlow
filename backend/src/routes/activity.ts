import { Router } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
export const activityRouter = Router();

activityRouter.use(authMiddleware);

/**
 * GET /api/activity
 * Returns recent activity (audit logs) relevant to the current user.
 * - STUDENT: activity on their own requests
 * - STAFF: activity on all requests (limited to last 50)
 */
activityRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const userRole = req.userRole!;
    const limit = Math.min(Number(req.query.limit) || 30, 50);

    const where: any = {};

    if (userRole === UserRole.STUDENT) {
      // Student sees activity only on requests they created
      where.request = { createdById: userId };
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } },
        request: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const items = logs.map((log) => ({
      id: log.id,
      action: log.action,
      meta: log.meta,
      createdAt: log.createdAt,
      actor: log.actor,
      request: log.request,
    }));

    res.json({ items });
  } catch (error) {
    next(error);
  }
});
