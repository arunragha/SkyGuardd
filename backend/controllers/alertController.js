import { alertRepository } from '../db/repositories/alertRepository.js';

export const alertController = {
  getAll: (req, res, next) => {
    try {
      const limit = parseInt(req.query.limit, 10) || 100;
      const alerts = alertRepository.getAll(limit);
      const unreadCount = alertRepository.getUnreadCount();
      res.json({ success: true, count: alerts.length, unreadCount, alerts });
    } catch (err) {
      next(err);
    }
  },

  getById: (req, res, next) => {
    try {
      const alert = alertRepository.getById(req.params.id);
      if (!alert) {
        return res.status(404).json({ success: false, message: 'Alert not found.' });
      }
      res.json({ success: true, alert });
    } catch (err) {
      next(err);
    }
  },

  updateStatus: (req, res, next) => {
    try {
      const { status } = req.body;
      const validStatuses = ['unread', 'read', 'dismissed'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of [${validStatuses.join(', ')}]`
        });
      }

      const updated = alertRepository.updateStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Alert not found.' });
      }
      res.json({ success: true, alert: updated });
    } catch (err) {
      next(err);
    }
  },

  markAllAsRead: (req, res, next) => {
    try {
      alertRepository.markAllAsRead();
      res.json({ success: true, message: 'All alerts marked as read.' });
    } catch (err) {
      next(err);
    }
  },

  getUnreadCount: (req, res, next) => {
    try {
      const unreadCount = alertRepository.getUnreadCount();
      res.json({ success: true, unreadCount });
    } catch (err) {
      next(err);
    }
  }
};
