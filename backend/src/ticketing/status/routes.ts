import { Router } from 'express';
import { getStatuses } from './handlers/getStatuses.js';

export const statusRouter = Router();

statusRouter.get('/status/options', getStatuses);

export default statusRouter;

