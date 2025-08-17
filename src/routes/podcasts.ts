import express from 'express';
import { Podcast } from '../models/Podcast';
import { User } from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Listar todos os podcasts públicos
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const whereClause: any = { isPublished: true };
    
    if (category) {
      whereClause.category = category;
    }
    
    if (search) {
      whereClause.title = { $like: `%${search}%` };
    }

    const podcasts = await Podcast.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email']
      }],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      podcasts: podcasts.rows,
      pagination: {
        total: podcasts.count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(podcasts.count / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar podcasts:', error);
    res.status(500).json({ error: 'Erro ao buscar podcasts' });
  }
});

// Buscar podcast por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const podcast = await Podcast.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email']
      }],
    });

    if (!podcast) {
      return res.status(404).json({ error: 'Podcast não encontrado' });
    }

    res.json(podcast);
  } catch (error) {
    console.error('Erro ao buscar podcast:', error);
    res.status(500).json({ error: 'Erro ao buscar podcast' });
  }
});

// Criar novo podcast (autenticado)
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, description, category, coverImage } = req.body;

    // Validação básica
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Título, descrição e categoria são obrigatórios' });
    }

    const podcast = await Podcast.create({
      title,
      description,
      category,
      coverImage,
      authorId: req.user!.id,
      isPublished: false,
    });

    res.status(201).json({
      message: 'Podcast criado com sucesso',
      podcast,
    });
  } catch (error) {
    console.error('Erro ao criar podcast:', error);
    res.status(500).json({ error: 'Erro ao criar podcast' });
  }
});

// Atualizar podcast (autenticado)
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, coverImage, isPublished } = req.body;

    const podcast = await Podcast.findByPk(id);

    if (!podcast) {
      return res.status(404).json({ error: 'Podcast não encontrado' });
    }

    // Verificar se o usuário é o autor
    if (podcast.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await podcast.update({
      title: title || podcast.title,
      description: description || podcast.description,
      category: category || podcast.category,
      coverImage: coverImage || podcast.coverImage,
      isPublished: isPublished !== undefined ? isPublished : podcast.isPublished,
    });

    res.json({
      message: 'Podcast atualizado com sucesso',
      podcast,
    });
  } catch (error) {
    console.error('Erro ao atualizar podcast:', error);
    res.status(500).json({ error: 'Erro ao atualizar podcast' });
  }
});

// Deletar podcast (autenticado)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const podcast = await Podcast.findByPk(id);

    if (!podcast) {
      return res.status(404).json({ error: 'Podcast não encontrado' });
    }

    // Verificar se o usuário é o autor
    if (podcast.authorId !== req.user!.id) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await podcast.destroy();

    res.json({ message: 'Podcast deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar podcast:', error);
    res.status(500).json({ error: 'Erro ao deletar podcast' });
  }
});

// Listar podcasts do usuário autenticado
router.get('/user/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const podcasts = await Podcast.findAndCountAll({
      where: { authorId: req.user!.id },
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      podcasts: podcasts.rows,
      pagination: {
        total: podcasts.count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(podcasts.count / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar podcasts do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar podcasts' });
  }
});

export default router;
