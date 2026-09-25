import { Router } from 'express';
import memberRoutes from './member.routes';
import locationRoutes from './location.routes';
import healthRoutes from './health.routes';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Location Tracking API is running' });
});

router.use('/', healthRoutes);
router.use('/api', memberRoutes);
router.use('/api', locationRoutes);

export default router;
