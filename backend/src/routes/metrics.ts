import { Router } from 'express';
import { PrismaClient, RequestStatus, UserRole } from '@prisma/client';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
export const metricsRouter = Router();

metricsRouter.use(authMiddleware);
metricsRouter.use(requireRole(UserRole.ADVISOR, UserRole.PROFESSOR, UserRole.DEPT_ADMIN, UserRole.DEAN, UserRole.SUPER_ADMIN));

/**
 * Get metrics dashboard data
 * GET /metrics
 */
metricsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    // Total requests
    const totalRequests = await prisma.request.count();

    // Requests by status
    const byStatus = await prisma.request.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // Requests by category
    const byCategory = await prisma.request.groupBy({
      by: ['category'],
      _count: { category: true },
      where: {
        category: { not: null },
      },
    });

    // Average resolution time (in hours)
    const resolvedRequests = await prisma.request.findMany({
      where: {
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    });

    let avgResolutionHours = 0;
    if (resolvedRequests.length > 0) {
      const totalHours = resolvedRequests.reduce((sum, req) => {
        const hours = (req.resolvedAt!.getTime() - req.createdAt.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      avgResolutionHours = Math.round((totalHours / resolvedRequests.length) * 100) / 100;
    }

    // SLA Risk: requests older than 24h still in SUBMITTED status
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const slaRiskCount = await prisma.request.count({
      where: {
        status: RequestStatus.SUBMITTED,
        createdAt: { lt: twentyFourHoursAgo },
      },
    });

    // Format response
    const statusMap: Record<string, number> = {};
    byStatus.forEach((item) => {
      statusMap[item.status] = item._count.status;
    });

    const categoryMap: Record<string, number> = {};
    byCategory.forEach((item) => {
      categoryMap[item.category || 'UNKNOWN'] = item._count.category;
    });

    res.json({
      totalRequests,
      byStatus: statusMap,
      byCategory: categoryMap,
      avgResolutionHours,
      slaRiskCount,
    });
  } catch (error) {
    next(error);
  }
});
