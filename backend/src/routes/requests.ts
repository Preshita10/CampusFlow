import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient, UserRole, RequestStatus, RequestCategory } from '@prisma/client';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import { classifyRequest, summarizeThread } from '../services/aiService';
import { AuditService } from '../services/auditService';

const prisma = new PrismaClient();
export const requestRouter = Router();

// Validation schemas
const createRequestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(RequestStatus),
});

const createCommentSchema = z.object({
  message: z.string().min(1).max(2000),
});

// Apply auth middleware to all routes
requestRouter.use(authMiddleware);

/**
 * Create a new request (STUDENT only)
 * POST /requests
 */
requestRouter.post(
  '/',
  requireRole(UserRole.STUDENT),
  async (req: AuthRequest, res, next) => {
    try {
      const { title, description } = createRequestSchema.parse(req.body);

      // Find first ADVISOR user for auto-assignment
      const advisorUser = await prisma.user.findFirst({
        where: { role: UserRole.ADVISOR },
      });

      if (!advisorUser) {
        return res.status(500).json({
          error: {
            code: 'NO_ADVISOR_AVAILABLE',
            message: 'No advisor available for assignment',
          },
        });
      }

      // Classify request using AI service
      const classification = classifyRequest(title, description);

      // Map classification category to RequestCategory enum
      const categoryMap: Record<string, RequestCategory> = {
        COURSE_OVERRIDE: RequestCategory.COURSE_OVERRIDE,
        ADD_DROP: RequestCategory.ADD_DROP,
        GRADUATION_AUDIT: RequestCategory.GRADUATION_AUDIT,
        RECOMMENDATION: RequestCategory.RECOMMENDATION,
        FUNDING: RequestCategory.FUNDING,
        GENERAL: RequestCategory.GENERAL,
      };

      // Create request
      const request = await prisma.request.create({
        data: {
          title,
          description,
          status: RequestStatus.SUBMITTED,
          category: categoryMap[classification.category] || RequestCategory.GENERAL,
          createdById: req.userId!,
          assignedToId: advisorUser.id,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Generate AI summary
      const summary = summarizeThread(
        request.title,
        request.description,
        request.status,
        request.assignedTo?.name || null,
        []
      );

      // Update request with summary
      const updatedRequest = await prisma.request.update({
        where: { id: request.id },
        data: { aiSummary: summary },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Log audit event
      await AuditService.logRequestCreated(request.id, req.userId!);
      await AuditService.logAssignmentChange(request.id, req.userId!, advisorUser.id);

      res.status(201).json(updatedRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: error.errors[0].message,
          },
        });
      }
      next(error);
    }
  }
);

/**
 * List requests (STUDENT sees own, STAFF sees all)
 * GET /requests?status=SUBMITTED&category=COURSE_OVERRIDE
 */
requestRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { status, category } = req.query;

    const where: any = {};

    // STUDENT can only see their own requests
    // All other roles (ADVISOR, PROFESSOR, DEPT_ADMIN, DEAN, SUPER_ADMIN) see all requests
    if (req.userRole === UserRole.STUDENT) {
      where.createdById = req.userId;
    }

    // Apply filters
    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }

    const requests = await prisma.request.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(requests);
  } catch (error) {
    next(error);
  }
});

/**
 * Get request by ID with comments and audit log
 * GET /requests/:id
 */
requestRouter.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        auditLogs: {
          include: {
            actor: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!request) {
      return res.status(404).json({
        error: {
          code: 'REQUEST_NOT_FOUND',
          message: 'Request not found',
        },
      });
    }

    // Check access: STUDENT can only view their own requests
    if (req.userRole === UserRole.STUDENT && request.createdById !== req.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only view your own requests',
        },
      });
    }

    // Regenerate AI summary with latest comments
    const commentsForSummary = request.comments.map((c) => ({
      message: c.message,
      authorName: c.author.name,
      createdAt: c.createdAt,
    }));

    const summary = summarizeThread(
      request.title,
      request.description,
      request.status,
      request.assignedTo?.name || null,
      commentsForSummary
    );

    // Update summary if it changed
    if (request.aiSummary !== summary) {
      await prisma.request.update({
        where: { id },
        data: { aiSummary: summary },
      });
      request.aiSummary = summary;
    }

    res.json(request);
  } catch (error) {
    next(error);
  }
});

/**
 * Update request status (ADVISOR, PROFESSOR, DEPT_ADMIN, DEAN, SUPER_ADMIN)
 * PATCH /requests/:id/status
 */
requestRouter.patch(
  '/:id/status',
  requireRole(UserRole.ADVISOR, UserRole.PROFESSOR, UserRole.DEPT_ADMIN, UserRole.DEAN, UserRole.SUPER_ADMIN),
  async (req: AuthRequest, res, next) => {
    try {
      const { id } = req.params;
      const { status } = updateStatusSchema.parse(req.body);

      const existingRequest = await prisma.request.findUnique({
        where: { id },
      });

      if (!existingRequest) {
        return res.status(404).json({
          error: {
            code: 'REQUEST_NOT_FOUND',
            message: 'Request not found',
          },
        });
      }

      // Update status and resolvedAt if needed
      const updateData: any = { status };
      if (status === RequestStatus.APPROVED || status === RequestStatus.REJECTED) {
        updateData.resolvedAt = new Date();
      } else if (existingRequest.resolvedAt) {
        updateData.resolvedAt = null; // Reset if reopening
      }

      const request = await prisma.request.update({
        where: { id },
        data: updateData,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Log status change
      await AuditService.logStatusChange(id, req.userId!, existingRequest.status, status);

      res.json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: error.errors[0].message,
          },
        });
      }
      next(error);
    }
  }
);

/**
 * Add comment to request (STUDENT or STAFF)
 * POST /requests/:id/comments
 */
requestRouter.post('/:id/comments', async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { message } = createCommentSchema.parse(req.body);

    // Verify request exists
    const request = await prisma.request.findUnique({
      where: { id },
    });

    if (!request) {
      return res.status(404).json({
        error: {
          code: 'REQUEST_NOT_FOUND',
          message: 'Request not found',
        },
      });
    }

    // Check access: STUDENT can only comment on their own requests
    if (req.userRole === UserRole.STUDENT && request.createdById !== req.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only comment on your own requests',
        },
      });
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        requestId: id,
        authorId: req.userId!,
        message,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // Log comment addition
    await AuditService.logCommentAdded(id, req.userId!, comment.id);

    res.status(201).json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.errors[0].message,
        },
      });
    }
    next(error);
  }
});
