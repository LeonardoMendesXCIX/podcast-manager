-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS podcast_manager;
USE podcast_manager;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url VARCHAR(255),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de podcasts
CREATE TABLE IF NOT EXISTS podcasts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    author VARCHAR(100),
    cover_image VARCHAR(255),
    category VARCHAR(50),
    language VARCHAR(10) DEFAULT 'pt-BR',
    website_url VARCHAR(255),
    rss_url VARCHAR(255),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de episódios
CREATE TABLE IF NOT EXISTS episodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    podcast_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    audio_url VARCHAR(255) NOT NULL,
    duration INT,
    published_date DATETIME,
    episode_number INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE
);

-- Tabela de favoritos
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    podcast_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_podcast (user_id, podcast_id)
);

-- Índices para melhorar performance
CREATE INDEX idx_podcasts_created_by ON podcasts(created_by);
CREATE INDEX idx_episodes_podcast_id ON episodes(podcast_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_podcast_id ON favorites(podcast_id);

-- Inserir usuário admin de teste (senha: admin123)
INSERT INTO users (username, email, password_hash, full_name) VALUES
('admin', 'admin@podcastmanager.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador');

-- Inserir alguns podcasts de exemplo
INSERT INTO podcasts (title, description, author, category, created_by) VALUES
('Podcast Tech Brasil', 'Tudo sobre tecnologia no Brasil', 'Tech Team', 'Tecnologia', 1),
('Histórias do Cotidiano', 'Histórias reais do dia a dia', 'Maria Silva', 'Vida Real', 1),
('Café com Código', 'Conversas sobre programação', 'Dev Team', 'Programação', 1);

-- Inserir episódios de exemplo
INSERT INTO episodes (podcast_id, title, description, audio_url, episode_number) VALUES
(1, 'Episódio 1: Introdução ao Podcast', 'Nosso primeiro episódio!', 'https://example.com/ep1.mp3', 1),
(1, 'Episódio 2: Tendências 2024', 'As principais tendências tecnológicas', 'https://example.com/ep2.mp3', 2),
(2, 'Episódio 1: Minha primeira história', 'Uma história emocionante', 'https://example.com/ep3.mp3', 1);
