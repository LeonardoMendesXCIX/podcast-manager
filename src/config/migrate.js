const db = require('./database');

const createTables = () => {
  const queries = [
    // Tabela de usuários
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      avatar VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tabela de podcasts
    `CREATE TABLE IF NOT EXISTS podcasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      author VARCHAR(100),
      cover_image VARCHAR(255),
      category VARCHAR(50),
      language VARCHAR(10) DEFAULT 'pt-BR',
      website_url VARCHAR(255),
      rss_url VARCHAR(255),
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )`,

    // Tabela de episódios
    `CREATE TABLE IF NOT EXISTS episodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      podcast_id INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      audio_url VARCHAR(255),
      duration INTEGER,
      published_date DATETIME,
      episode_number INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE
    )`,

    // Tabela de favoritos
    `CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      podcast_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE,
      UNIQUE(user_id, podcast_id)
    )`
  ];

  queries.forEach(query => {
    db.run(query, (err) => {
      if (err) {
        console.error('Erro ao criar tabela:', err.message);
      }
    });
  });

  console.log('Tabelas criadas com sucesso!');
};

// Executar migrações
createTables();

module.exports = { createTables };
