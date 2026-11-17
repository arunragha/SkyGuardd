import { Router } from 'express';
import { alertController } from '../controllers/alertController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', alertController.getAll);
router.get('/unread-count', alertController.getUnreadCount);
router.get('/:id', alertController.getById);

// Protected actions: Modifying alert state requires authenticated operator
router.patch('/:id', authenticateToken, alertController.updateStatus);
router.post('/read-all', authenticateToken, alertController.markAllAsRead);

export default router;
