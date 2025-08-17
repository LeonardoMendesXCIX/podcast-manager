const db = require('../config/database');

class Episode {
  static async create(episodeData) {
    const { podcastId, title, description, audioUrl, duration, publishedDate, episodeNumber } = episodeData;
    const [result] = await db.execute(
      'INSERT INTO episodes (podcast_id, title, description, audio_url, duration, published_date, episode_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [podcastId, title, description, audioUrl, duration, publishedDate, episodeNumber]
    );
    return result.insertId;
  }

  static async findAll(limit = 50, offset = 0) {
    const [rows] = await db.execute(
      `SELECT e.*, p.title as podcast_title, p.cover_image as podcast_cover 
       FROM episodes e 
       JOIN podcasts p ON e.podcast_id = p.id 
       ORDER BY e.published_date DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT e.*, p.title as podcast_title, p.cover_image as podcast_cover 
       FROM episodes e 
       JOIN podcasts p ON e.podcast_id = p.id 
       WHERE e.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByPodcast(podcastId, limit = 50, offset = 0) {
    const [rows] = await db.execute(
      `SELECT e.*, p.title as podcast_title, p.cover_image as podcast_cover 
       FROM episodes e 
       JOIN podcasts p ON e.podcast_id = p.id 
       WHERE e.podcast_id = ? 
       ORDER BY e.published_date DESC 
       LIMIT ? OFFSET ?`,
      [podcastId, limit, offset]
    );
    return rows;
  }

  static async search(query, limit = 50, offset = 0) {
    const [rows] = await db.execute(
      `SELECT e.*, p.title as podcast_title, p.cover_image as podcast_cover 
       FROM episodes e 
       JOIN podcasts p ON e.podcast_id = p.id 
       WHERE e.title LIKE ? OR e.description LIKE ?
       ORDER BY e.published_date DESC 
       LIMIT ? OFFSET ?`,
      [`%${query}%`, `%${query}%`, limit, offset]
    );
    return rows;
  }

  static async update(id, episodeData) {
    const { title, description, audioUrl, duration, publishedDate, episodeNumber } = episodeData;
    const [result] = await db.execute(
      'UPDATE episodes SET title = ?, description = ?, audio_url = ?, duration = ?, published_date = ?, episode_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, description, audioUrl, duration, publishedDate, episodeNumber, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute('DELETE FROM episodes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Episode;
