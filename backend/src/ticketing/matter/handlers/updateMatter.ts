import { Request, Response } from 'express';
import { MatterService } from '../service/matter_service.js';
import { z } from 'zod';
import logger from '../../../utils/logger.js';

const paramsSchema = z.object({
  id: z.string().uuid({ message: 'Invalid matter ID format' }),
});

const updateSchema = z.object({
  fieldId: z.string().uuid({ message: 'Invalid field ID format' }),
  fieldType: z.enum(['text', 'number', 'select', 'date', 'currency', 'boolean', 'status', 'user']),
  value: z.union([
    z.string().max(10000),
    z.number(),
    z.boolean(),
    z.date(),
    z.object({
      amount: z.number(),
      currency: z.string().length(3),
    }),
    z.object({
      id: z.number(),
      email: z.string().email(),
      firstName: z.string(),
      lastName: z.string(),
      displayName: z.string(),
    }),
    z.object({
      statusId: z.string(),
      groupName: z.string(),
      label: z.string(),
    }),
    z.null(),
  ]),
});

export async function updateMatter(req: Request, res: Response): Promise<void> {
  try {
    const { id } = paramsSchema.parse(req.params);
    const body = updateSchema.parse(req.body);
    
    // Default user ID (in production, this would come from authentication)
    const userId = 1;

    const matterService = new MatterService();
    await matterService.updateMatter(id, body.fieldId, body.fieldType, body.value, userId);

    // Return updated matter
    const updatedMatter = await matterService.getMatterById(id);
    
    res.json(updatedMatter);
  } catch (error) {
    logger.error('Error updating matter', { error, matterId: req.params.id });
    
    if (error instanceof z.ZodError) {
      // Sanitize validation errors to avoid leaking internal structure
      const sanitizedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      res.status(400).json({
        error: 'Invalid request data',
        details: sanitizedErrors,
      });
      return;
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}

