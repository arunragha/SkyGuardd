import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validationMiddleware.js';

const router = Router();

const registerSchema = {
  name: { required: true, type: 'string', minLength: 2 },
  email: { required: true, type: 'email' },
  password: { required: true, type: 'string', minLength: 6 }
};

const loginSchema = {
  email: { required: true, type: 'email' },
  password: { required: true, type: 'string' }
};

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.get('/users', authenticateToken, requireRole('admin'), authController.getAllUsers);

export default router;
