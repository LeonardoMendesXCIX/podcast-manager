const Episode = require('../models/Episode');
const Podcast = require('../models/Podcast');

const episodeController = {
  async create(req, res) {
    try {
      const { podcastId } = req.params;
      const { title, description, duration, episodeNumber } = req.body;
      const audioFile = req.file ? `/uploads/${req.file.filename}` : null;

      // Verificar se o podcast existe e pertence ao usuário
      const podcast = await Podcast.findById(podcastId);
      if (!podcast) {
        return res.status(404).json({ error: 'Podcast não encontrado' });
      }

      if (podcast.created_by !== req.userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      if (!audioFile) {
        return res.status(400).json({ error: 'Arquivo de áudio é obrigatório' });
      }

      const episodeId = await Episode.create({
        podcastId,
        title,
        description,
        audioUrl: audioFile,
        duration: parseInt(duration),
        episodeNumber: parseInt(episodeNumber)
      });

      const episode = await Episode.findById(episodeId);
      res.status(201).json({
        message: 'Episódio criado com sucesso',
        episode
      });
    } catch (error) {
      console.error('Erro ao criar episódio:', error);
      res.status(500).json({ error: 'Erro ao criar episódio' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const episode = await Episode.findById(id);

      if (!episode) {
        return res.status(404).json({ error: 'Episódio não encontrado' });
      }

      res.json({ episode });
    } catch (error) {
      console.error('Erro ao buscar episódio:', error);
      res.status(500).json({ error: 'Erro ao buscar episódio' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, duration, episodeNumber } = req.body;
      const audioFile = req.file ? `/uploads/${req.file.filename}` : null;

      const episode = await Episode.findById(id);
      if (!episode) {
        return res.status(404).json({ error: 'Episódio não encontrado' });
      }

      // Verificar se o podcast pertence ao usuário
      const podcast = await Podcast.findById(episode.podcast_id);
      if (podcast.created_by !== req.userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const updateData = {
        title,
        description,
        duration: parseInt(duration),
        episodeNumber: parseInt(episodeNumber)
      };

      if (audioFile) {
        updateData.audioUrl = audioFile;
      }

      const updated = await Episode.update(id, updateData);
      if (!updated) {
        return res.status(404).json({ error: 'Episódio não encontrado' });
      }

      const updatedEpisode = await Episode.findById(id);
      res.json({
        message: 'Episódio atualizado com sucesso',
        episode: updatedEpisode
      });
    } catch (error) {
      console.error('Erro ao atualizar episódio:', error);
      res.status(500).json({ error: 'Erro ao atualizar episódio' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const episode = await Episode.findById(id);

      if (!episode) {
        return res.status(404).json({ error: 'Episódio não encontrado' });
      }

      // Verificar se o podcast pertence ao usuário
      const podcast = await Podcast.findById(episode.podcast_id);
      if (podcast.created_by !== req.userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const deleted = await Episode.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Episódio não encontrado' });
      }

      res.json({ message: 'Episódio deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar episódio:', error);
      res.status(500).json({ error: 'Erro ao deletar episódio' });
    }
  },

  async getByPodcast(req, res) {
    try {
      const { podcastId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const podcast = await Podcast.findById(podcastId);
      if (!podcast) {
        return res.status(404).json({ error: 'Podcast não encontrado' });
      }

      const episodes = await Episode.findByPodcast(podcastId, parseInt(limit), offset);
      
      res.json({
        episodes,
        podcast: {
          id: podcast.id,
          title: podcast.title
        },
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar episódios:', error);
      res.status(500).json({ error: 'Erro ao buscar episódios' });
    }
  }
};

module.exports = episodeController;
