import { Request, Response } from 'express';
import { updateLocation } from '../services/location.service';

export async function handleLocationUpdate(req: Request, res: Response): Promise<void> {
  try {
    const { memberId, lat, lng } = req.body;
    if (!memberId || lat === undefined || lng === undefined) {
      res.status(400).json({ error: 'memberId, lat, and lng are required' });
      return;
    }

    await updateLocation(memberId, Number(lat), Number(lng));
    res.status(202).json({ status: 'Location accepted' });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
