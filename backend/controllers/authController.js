import { authService } from '../services/authService.js';

export const authController = {
  register: async (req, res, next) => {
    try {
      const { email, password, fullName, role } = req.body;
      const result = await authService.register({ email, password, fullName, role });
      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      res.json({
        success: true,
        message: 'Authentication successful.',
        ...result
      });
    } catch (err) {
      next(err);
    }
  },

  getCurrentUser: async (req, res) => {
    res.json({
      success: true,
      user: req.user
    });
  }
};
