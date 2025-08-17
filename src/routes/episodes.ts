import express from 'express';
import { Episode } from '../models/Episode';
import { Podcast } from '../models/Podcast';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Listar episódios de um podcast
router.get('/podcast/:podcastId', async (req, res) => {
  try {
    const { podcastId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Verificar se o podcast existe
    const podcast = await Podcast.findByPk(podcastId);
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast não encontrado' });
    }

    const episodes = await Episode.findAndCountAll({
      where: { 
        podcastId,
        isPublished: true 
      },
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      episodes: episodes.rows,
      pagination: {
        total: episodes.count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(episodes.count / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar episódios:', error);
    res.status(500).json({ error: 'Erro ao buscar episódios' });
  }
});

// Buscar episódio por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const episode = await Episode.findByPk(id, {
      include: [{
        model: Podcast,
        as: 'podcast',
        attributes: ['id', 'title', 'category']
      }],
    });

    if (!episode) {
      return res.status(404).json({ error: 'Episódio não encontrado' });
    }

    res.json(episode);
  } catch (error) {
    console.error('Erro ao buscar episódio:', error);
    res.status(500).json({ error: 'Erro ao buscar episódio' });
  }
});

// Criar novo episódio (autenticado)
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, description, duration, audioUrl, podcastId } = req.body;

    // Validação básica
    if (!title || !description || !duration || !audioUrl || !podcastId) {
      return res.status(400).json({ 
        error: 'Título, descrição, duração, URL do áudio e ID do podcast são obrigatórios' 
      });
    }

    // Verificar se o podcast existe e pertence ao usuário
    const podcast = await Podcast.findByPk(podcastId);
    if (!podcast) {
      return res.status(404).json({ error: 'Podcast não encontrado' });
    }

    if (podcast.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const episode = await Episode.create({
      title,
      description,
      duration,
      audioUrl,
      podcastId,
      isPublished: false,
    });

    res.status(201).json({
      message: 'Episódio criado com sucesso',
      episode,
    });
  } catch (error) {
    console.error('Erro ao criar episódio:', error);
    res.status(500).json({ error: 'Erro ao criar episódio' });
  }
});

// Atualizar episódio (autenticado)
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description, duration, audioUrl, isPublished, publishedAt } = req.body;

    const episode = await Episode.findByPk(id, {
      include: [{
        model: Podcast,
        as: 'podcast',
        attributes: ['id', 'authorId']
      }],
    });

    if (!episode) {
      return res.status(404).json({ error: 'Episódio não encontrado' });
    }

    // Verificar se o usuário é o autor do podcast
    const podcast = episode.get('podcast') as Podcast;
    if (podcast.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await episode.update({
      title: title || episode.title,
      description: description || episode.description,
      duration: duration || episode.duration,
      audioUrl: audioUrl || episode.audioUrl,
      isPublished: isPublished !== undefined ? isPublished : episode.isPublished,
      publishedAt: publishedAt || episode.publishedAt,
    });

    res.json({
      message: 'Episódio atualizado com sucesso',
      episode,
    });
  } catch (error) {
    console.error('Erro ao atualizar episódio:', error);
    res.status(500).json({ error: 'Erro ao atualizar episódio' });
  }
});

// Deletar episódio (autenticado)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const episode = await Episode.findByPk(id, {
      include: [{
        model: Podcast,
        as: 'podcast',
        attributes: ['authorId']
      }],
    });

    if (!episode) {
      return res.status(404).json({ error: 'Episódio não encontrado' });
    }

    // Verificar se o usuário é o autor do podcast
    const podcast = episode.get('podcast') as Podcast;
    if (podcast.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await episode.destroy();

    res.json({ message: 'Episódio deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar episódio:', error);
    res.status(500).json({ error: 'Erro ao deletar episódio' });
  }
});

// Publicar episódio (autenticado)
router.patch('/:id/publish', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const episode = await Episode.findByPk(id, {
      include: [{
        model: Podcast,
        as: 'podcast',
      }],
    });

    if (!episode) {
      return res.status(404).json({ error: 'Episódio não encontrado' });
    }

    // Verificar se o usuário é o autor do podcast
    const podcast = episode.get('podcast') as Podcast;
    if (podcast.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await episode.update({
      isPublished: true,
      publishedAt: new Date(),
    });

    res.json({
      message: 'Episódio publicado com sucesso',
      episode,
    });
  } catch (error) {
    console.error('Erro ao publicar episódio:', error);
    res.status(500).json({ error: 'Erro ao publicar episódio' });
  }
});

export default router;
