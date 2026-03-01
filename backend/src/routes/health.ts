import { Router } from 'express';

export const healthRouter = Router();

/**
 * Health check endpoint
 * GET /health
 */
healthRouter.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'campusflow-backend',
  });
});
