import { Request, Response } from 'express';
import { Podcast, Episode, User } from '../models';
import { createError, asyncHandler } from '../middlewares/errorHandler';
import { Op } from 'sequelize';

export const createPodcast = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, category, coverImage } = req.body;

  const podcast = await Podcast.create({
    title,
    description,
    category,
    coverImage,
    authorId: req.user.id,
  });

  const podcastWithAuthor = await Podcast.findByPk(podcast.id, {
    include: [{
      model: User,
      as: 'author',
      attributes: ['id', 'name', 'email'],
    }],
  });

  res.status(201).json({
    success: true,
    data: { podcast: podcastWithAuthor },
  });
});

export const getPodcasts = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search, category, author } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const where: any = { isActive: true };
  
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  if (category) {
    where.category = category;
  }

  if (author) {
    where.authorId = author;
  }

  const { count, rows: podcasts } = await Podcast.findAndCountAll({
    where,
    include: [{
      model: User,
      as: 'author',
      attributes: ['id', 'name', 'email'],
    }],
    limit: Number(limit),
    offset,
    order: [['createdAt', 'DESC']],
  });

  res.json({
    success: true,
    data: {
      podcasts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / Number(limit)),
      },
    },
  });
});

export const getPodcast = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const podcast = await Podcast.findByPk(id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: Episode,
        as: 'episodes',
        where: { isPublished: true },
        required: false,
        order: [['episodeNumber', 'ASC']],
      },
    ],
  });

  if (!podcast) {
    throw createError('Podcast não encontrado', 404);
  }

  res.json({
    success: true,
    data: { podcast },
  });
});

export const updatePodcast = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, category, coverImage } = req.body;

  const podcast = await Podcast.findByPk(id);
  if (!podcast) {
    throw createError('Podcast não encontrado', 404);
  }

  if (podcast.authorId !== req.user.id && req.user.role !== 'admin') {
    throw createError('Acesso negado', 403);
  }

  await podcast.update({
    title: title || podcast.title,
    description: description || podcast.description,
    category: category || podcast.category,
    coverImage: coverImage || podcast.coverImage,
  });

  const updatedPodcast = await Podcast.findByPk(id, {
    include: [{
      model: User,
      as: 'author',
      attributes: ['id', 'name', 'email'],
    }],
  });

  res.json({
    success: true,
    data: { podcast: updatedPodcast },
  });
});

export const deletePodcast = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const podcast = await Podcast.findByPk(id);
  if (!podcast) {
    throw createError('Podcast não encontrado', 404);
  }

  if (podcast.authorId !== req.user.id && req.user.role !== 'admin') {
    throw createError('Acesso negado', 403);
  }

  await podcast.update({ isActive: false });

  res.json({
    success: true,
    message: 'Podcast desativado com sucesso',
  });
});
