const Podcast = require('../models/Podcast');
const Episode = require('../models/Episode');
const Favorite = require('../models/Favorite');

const podcastController = {
  async create(req, res) {
    try {
      const { title, description, author, category, language, websiteUrl, rssUrl } = req.body;
      const coverImage = req.file ? `/uploads/${req.file.filename}` : null;

      const podcastId = await Podcast.create({
        title,
        description,
        author,
        coverImage,
        category,
        language,
        websiteUrl,
        rssUrl,
        createdBy: req.userId
      });

      const podcast = await Podcast.findById(podcastId);
      res.status(201).json({
        message: 'Podcast criado com sucesso',
        podcast
      });
    } catch (error) {
      console.error('Erro ao criar podcast:', error);
      res.status(500).json({ error: 'Erro ao criar podcast' });
    }
  },

  async getAll(req, res) {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const offset = (page - 1) * limit;

      let podcasts;
      let total;

      if (search) {
        podcasts = await Podcast.search(search, parseInt(limit), offset);
        total = podcasts.length; // Simplificado - em produção usar COUNT
      } else {
        podcasts = await Podcast.findAll(parseInt(limit), offset);
        total = await Podcast.count(); // Adicionar método count
      }

      res.json({
        podcasts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total
        }
      });
    } catch (error) {
      console.error('Erro ao buscar podcasts:', error);
      res.status(500).json({ error: 'Erro ao buscar podcasts' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const podcast = await Podcast.findById(id);

      if (!podcast) {
        return res.status(404).json({ error: 'Podcast não encontrado' });
      }

      const episodes = await Episode.findByPodcast(id);
      const isFavorite = await Favorite.isFavorite(req.userId, id);

      res.json({
        podcast,
        episodes,
        isFavorite
      });
    } catch (error) {
      console.error('Erro ao buscar podcast:', error);
      res.status(500).json({ error: 'Erro ao buscar podcast' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, author, category, language, websiteUrl, rssUrl } = req.body;
      const coverImage = req.file ? `/uploads/${req.file.filename}` : null;

      const podcast = await Podcast.findById(id);
      if (!podcast) {
        return res.status(404).json({ error: 'Podcast não encontrado' });
      }

      if (podcast.created_by !== req.userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const updateData = {
        title,
        description,
        author,
        category,
        language,
        websiteUrl,
        rssUrl
      };

      if (coverImage) {
        updateData.coverImage = coverImage;
      }

      const updated = await Podcast.update(id, updateData);
      if (!updated) {
        return res.status(404).json({ error: 'Podcast não encontrado' });
      }

      const updatedPodcast = await Podcast.findById(id);
      res.json({
        message: 'Podcast atualizado com sucesso',
        podcast: updatedPodcast
      });
    } catch (error) {
      console.error('Erro ao atualizar podcast:', error);
      res.status(500).json({ error: 'Erro ao atualizar podcast' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const podcast = await Podcast.findById(id);

      if (!podcast) {
        return res.status(404).json({ error: 'Podcast não encontrado' });
      }

      if (podcast.created_by !== req.userId) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      const deleted = await Podcast.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Podcast não encontrado' });
      }

      res.json({ message: 'Podcast deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar podcast:', error);
      res.status(500).json({ error: 'Erro ao deletar podcast' });
    }
  },

  async getUserPodcasts(req, res) {
    try {
      const podcasts = await Podcast.findByUser(req.userId);
      res.json({ podcasts });
    } catch (error) {
      console.error('Erro ao buscar podcasts do usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar podcasts do usuário' });
    }
  },

  async search(req, res) {
    try {
      const { q, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      if (!q) {
        return res.status(400).json({ error: 'Parâmetro de busca é obrigatório' });
      }

      const podcasts = await Podcast.search(q, parseInt(limit), offset);
      
      res.json({
        podcasts,
        query: q,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar podcasts:', error);
      res.status(500).json({ error: 'Erro ao buscar podcasts' });
    }
  }
};

module.exports = podcastController;
