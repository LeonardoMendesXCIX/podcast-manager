const db = require('../config/database');

class Favorite {
  static async add(userId, podcastId) {
    const [result] = await db.execute(
      'INSERT INTO favorites (user_id, podcast_id) VALUES (?, ?)',
      [userId, podcastId]
    );
    return result.insertId;
  }

  static async remove(userId, podcastId) {
    const [result] = await db.execute(
      'DELETE FROM favorites WHERE user_id = ? AND podcast_id = ?',
      [userId, podcastId]
    );
    return result.affectedRows > 0;
  }

  static async findByUser(userId, limit = 50, offset = 0) {
    const [rows] = await db.execute(
      `SELECT p.*, u.username as created_by_username 
       FROM favorites f 
       JOIN podcasts p ON f.podcast_id = p.id 
       JOIN users u ON p.created_by = u.id 
       WHERE f.user_id = ? 
       ORDER BY f.created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return rows;
  }

  static async isFavorite(userId, podcastId) {
    const [rows] = await db.execute(
      'SELECT 1 FROM favorites WHERE user_id = ? AND podcast_id = ?',
      [userId, podcastId]
    );
    return rows.length > 0;
  }

  static async countByPodcast(podcastId) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as count FROM favorites WHERE podcast_id = ?',
      [podcastId]
    );
    return rows[0].count;
  }
}

module.exports = Favorite;
