import { Request, Response } from 'express';
import { findOrCreateMember } from '../services/member.service';

export async function registerMember(req: Request, res: Response): Promise<void> {
  try {
    const { email, name } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    
    const user = await findOrCreateMember(email, name);
    res.json({ memberId: user.id, email: user.email, name: user.name });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
