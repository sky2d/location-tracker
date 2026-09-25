import { Router } from 'express';
import { handleLocationUpdate } from '../controllers/location.controller';

const router = Router();
router.post('/location', handleLocationUpdate);

export default router;
