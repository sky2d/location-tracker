import { Router } from 'express';
import { registerMember } from '../controllers/member.controller';

const router = Router();
router.post('/register', registerMember);

export default router;
