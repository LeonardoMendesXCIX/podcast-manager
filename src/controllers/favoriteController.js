const Favorite = require('../models/Favorite');
const Podcast = require('../models/Podcast');

const favoriteController = {
  async addFavorite(req, res) {
    try {
      const { podcastId } = req.params;
      const userId = req.userId;

      // Verificar se o podcast existe
      const podcast = await Podcast.findById(podcastId);
      if (!podcast) {
        return res.status(404).json({ error: 'Podcast não encontrado' });
      }

      // Verificar se já é favorito
      const isFavorite = await Favorite.isFavorite(userId, podcastId);
      if (isFavorite) {
        return res.status(400).json({ error: 'Podcast já está nos favoritos' });
      }

      await Favorite.add(userId, podcastId);
      res.json({ message: 'Podcast adicionado aos favoritos' });
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      res.status(500).json({ error: 'Erro ao adicionar favorito' });
    }
  },

  async removeFavorite(req, res) {
    try {
      const { podcastId } = req.params;
      const userId = req.userId;

      const isFavorite = await Favorite.isFavorite(userId, podcastId);
      if (!isFavorite) {
        return res.status(400).json({ error: 'Podcast não está nos favoritos' });
      }

      await Favorite.remove(userId, podcastId);
      res.json({ message: 'Podcast removido dos favoritos' });
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      res.status(500).json({ error: 'Erro ao remover favorito' });
    }
  },

  async getUserFavorites(req, res) {
    try {
      const userId = req.userId;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const favorites = await Favorite.getUserFavorites(userId, parseInt(limit), offset);
      
      res.json({
        favorites,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      res.status(500).json({ error: 'Erro ao buscar favoritos' });
    }
  },

  async toggleFavorite(req, res) {
    try {
      const { podcastId } = req.params;
      const userId = req.userId;

      const podcast = await Podcast.findById(podcastId);
      if (!podcast) {
        return res.status(404).json({ error: 'Podcast não encontrado' });
      }

      const isFavorite = await Favorite.isFavorite(userId, podcastId);
      
      if (isFavorite) {
        await Favorite.remove(userId, podcastId);
        res.json({ message: 'Podcast removido dos favoritos', isFavorite: false });
      } else {
        await Favorite.add(userId, podcastId);
        res.json({ message: 'Podcast adicionado aos favoritos', isFavorite: true });
      }
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      res.status(500).json({ error: 'Erro ao alternar favorito' });
    }
  }
};

module.exports = favoriteController;
