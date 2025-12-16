import { Request, Response } from 'express';
import logger from '../../../utils/logger.js';
import { StatusService } from '../service/status_service.js';

export async function getStatuses(_req: Request, res: Response) {
  try {
    const statusService = new StatusService();
    const statuses = await statusService.getStatusOptions();
    res.json(statuses);
  } catch (error) {
    logger.error('Error fetching statuses', { error });
    res.status(500).json({ error: 'An unexpected error occurred when retrieving statuses. Please contact support.' });
  }
}

