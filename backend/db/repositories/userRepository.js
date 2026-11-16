import { db } from '../database.js';

export const userRepository = {
  findByEmail: (email) => {
    return db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email);
  },

  findById: (id) => {
    const user = db.prepare('SELECT id, email, full_name, role, created_at, updated_at FROM users WHERE id = ?').get(id);
    return user || null;
  },

  create: ({ id, email, passwordHash, fullName, role = 'operator' }) => {
    db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, email.toLowerCase(), passwordHash, fullName, role);
    return userRepository.findById(id);
  },

  count: () => {
    return db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  }
};
