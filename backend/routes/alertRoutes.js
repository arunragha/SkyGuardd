import { Router } from 'express';
import { alertController } from '../controllers/alertController.js';

const router = Router();

router.get('/', alertController.getAll);
router.get('/unread-count', alertController.getUnreadCount);
router.get('/:id', alertController.getById);
router.patch('/:id', alertController.updateStatus);
router.post('/read-all', alertController.markAllAsRead);

export default router;
