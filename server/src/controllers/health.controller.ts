import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { redis } from '../config/redis';

export async function checkHealth(req: Request, res: Response): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    res.json({ status: 'ok', database: 'connected', redis: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', error: String(error) });
  }
}
