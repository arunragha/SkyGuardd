import { db } from '../database.js';

export const systemEventRepository = {
  logEvent: (eventType, severity = 'info', description, metadata = {}) => {
    return db.prepare(`
      INSERT INTO system_events (event_type, severity, description, metadata_json)
      VALUES (?, ?, ?, ?)
    `).run(eventType, severity, description, JSON.stringify(metadata));
  },

  getRecent: (limit = 50) => {
    const rows = db.prepare('SELECT * FROM system_events ORDER BY id DESC LIMIT ?').all(limit);
    return rows.map(r => ({
      id: r.id,
      eventType: r.event_type,
      severity: r.severity,
      description: r.description,
      timestamp: r.timestamp,
      metadata: JSON.parse(r.metadata_json || '{}')
    }));
  }
};
