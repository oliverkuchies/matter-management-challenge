import { Request, Response } from 'express';
import { MatterService } from '../service/matter_service.js';
import { z } from 'zod';
import logger from '../../../utils/logger.js';

const querySchema = z.object({
  page: z.string().optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0 && val <= 1000, { message: 'Page must be between 1 and 1000' }),
  limit: z.string().optional()
    .transform((val) => (val ? parseInt(val, 10) : 25))
    .refine((val) => val > 0 && val <= 100, { message: 'Limit must be between 1 and 100' }),
  sortBy: z.string()
    .max(100)
    .optional()
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string()
    .max(500)
    .optional()
    .default('')
    .transform((val) => val.trim()),
  sla: z.enum(['All', 'In Progress', 'Met', 'Breached'])
    .optional()
    .default('All'),
  resolutionTime: z.enum(['All', 'Under 1 hour', '1-4 hours', '4-8 hours', 'Over 8 hours'])
    .optional()
    .default('All'),
  dueDate: z.enum(['All', 'Overdue', 'Due Today', 'Due This Week', 'Due This Month', 'No Due Date'])
    .optional()
    .default('All'),
});

export async function getMatters(req: Request, res: Response): Promise<void> {
  try {
    const params = querySchema.parse(req.query);
    
    const matterService = new MatterService();
    const result = await matterService.getMatters(params);

    res.json(result);
  } catch (error) {
    logger.error('Error fetching matters', { error, query: req.query });
    
    if (error instanceof z.ZodError) {
      // Sanitize validation errors to avoid leaking internal structure
      const sanitizedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      res.status(400).json({
        error: 'Invalid query parameters',
        details: sanitizedErrors,
      });
      return;
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}

