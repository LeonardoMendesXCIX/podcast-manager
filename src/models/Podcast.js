const db = require('../config/database');

class Podcast {
  static async create(podcastData) {
    const { title, description, author, coverImage, category, language, websiteUrl, rssUrl, createdBy } = podcastData;
    const [result] = await db.execute(
      'INSERT INTO podcasts (title, description, author, cover_image, category, language, website_url, rss_url, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, author, coverImage, category, language, websiteUrl, rssUrl, createdBy]
    );
    return result.insertId;
  }

  static async findAll(limit = 20, offset = 0) {
    const [rows] = await db.execute(
      `SELECT p.*, u.username as created_by_username 
       FROM podcasts p 
       JOIN users u ON p.created_by = u.id 
       ORDER BY p.created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT p.*, u.username as created_by_username 
       FROM podcasts p 
       JOIN users u ON p.created_by = u.id 
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async search(query, limit = 20, offset = 0) {
    const [rows] = await db.execute(
      `SELECT p.*, u.username as created_by_username 
       FROM podcasts p 
       JOIN users u ON p.created_by = u.id 
       WHERE p.title LIKE ? OR p.description LIKE ? OR p.author LIKE ?
       ORDER BY p.created_at DESC 
       LIMIT ? OFFSET ?`,
      [`%${query}%`, `%${query}%`, `%${query}%`, limit, offset]
    );
    return rows;
  }

  static async update(id, podcastData) {
    const { title, description, author, coverImage, category, language, websiteUrl, rssUrl } = podcastData;
    const [result] = await db.execute(
      'UPDATE podcasts SET title = ?, description = ?, author = ?, cover_image = ?, category = ?, language = ?, website_url = ?, rss_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description, author, coverImage, category, language, websiteUrl, rssUrl, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM podcasts WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async findByUser(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM podcasts WHERE created_by = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }
}

module.exports = Podcast;
