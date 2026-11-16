import { db } from '../database.js';

export const alertRepository = {
  getAll: (limit = 100) => {
    const rows = db.prepare('SELECT * FROM alerts ORDER BY created_at DESC LIMIT ?').all(limit);
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      stationId: r.station_id,
      stationName: r.station_name,
      sensor: r.sensor,
      severity: r.severity,
      timestamp: r.timestamp,
      description: r.description,
      status: r.status,
      anomalyId: r.anomaly_id
    }));
  },

  getById: (id) => {
    const r = db.prepare('SELECT * FROM alerts WHERE id = ?').get(id);
    if (!r) return null;
    return {
      id: r.id,
      title: r.title,
      stationId: r.station_id,
      stationName: r.station_name,
      sensor: r.sensor,
      severity: r.severity,
      timestamp: r.timestamp,
      description: r.description,
      status: r.status,
      anomalyId: r.anomaly_id
    };
  },

  insert: (a) => {
    db.prepare(`
      INSERT INTO alerts (id, title, station_id, station_name, sensor, severity, timestamp, description, status, anomaly_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      a.id, a.title, a.stationId, a.stationName, a.sensor, a.severity,
      a.timestamp || 'Just now', a.description, a.status || 'unread', a.anomalyId || null
    );
    return alertRepository.getById(a.id);
  },

  updateStatus: (id, status) => {
    db.prepare('UPDATE alerts SET status = ? WHERE id = ?').run(status, id);
    return alertRepository.getById(id);
  },

  markAllAsRead: () => {
    db.prepare("UPDATE alerts SET status = 'read' WHERE status = 'unread'").run();
  },

  getUnreadCount: () => {
    return db.prepare("SELECT COUNT(*) as count FROM alerts WHERE status = 'unread'").get().count;
  }
};
