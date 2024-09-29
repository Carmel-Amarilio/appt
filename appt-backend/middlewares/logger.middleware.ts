import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger.service';

export async function log(req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.info('Request was made', req.route?.path);
    next();
}
