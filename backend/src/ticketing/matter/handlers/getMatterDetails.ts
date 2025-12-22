import { Request, Response } from 'express';
import { MatterService } from '../service/matter_service.js';
import { z } from 'zod';
import logger from '../../../utils/logger.js';

const paramsSchema = z.object({
  id: z.string().uuid({ message: 'Invalid matter ID format' }),
});

export async function getMatterDetails(req: Request, res: Response): Promise<void> {
  try {
    const { id } = paramsSchema.parse(req.params);

    const matterService = new MatterService();
    const matter = await matterService.getMatterById(id);

    if (!matter) {
      res.status(404).json({ error: 'Matter not found' });
      return;
    }

    res.json(matter);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Invalid matter ID format',
      });
      return;
    }
    
    logger.error('Error fetching matter details', { error, matterId: req.params.id });
    res.status(500).json({ error: 'Internal server error' });
  }
}

