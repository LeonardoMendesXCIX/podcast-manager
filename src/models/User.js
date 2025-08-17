const db = require('../config/database');

class User {
  static async create(userData) {
    const { username, email, passwordHash, fullName } = userData;
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, fullName]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, username, email, full_name, avatar_url, bio, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async update(id, userData) {
    const { fullName, bio, avatarUrl } = userData;
    const [result] = await db.execute(
      'UPDATE users SET full_name = ?, bio = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [fullName, bio, avatarUrl, id]
    );
    return result.affectedRows > 0;
  }

  static async updatePassword(id, passwordHash) {
    const [result] = await db.execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [passwordHash, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = User;
