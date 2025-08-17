import { Request, Response } from 'express';
import { Episode, Podcast, User } from '../models';
import { createError, asyncHandler } from '../middlewares/errorHandler';
import { Op } from 'sequelize';

export const createEpisode = asyncHandler(async (req: Request, res: Response) => {
  const { podcastId } = req.params;
  const { title, description, audioUrl, duration, episodeNumber } = req.body;

  const podcast = await Podcast.findByPk(podcastId);
  if (!podcast) {
    throw createError('Podcast não encontrado', 404);
  }

  if (podcast.authorId !== req.user.id && req.user.role !== 'admin') {
    throw createError('Acesso negado', 403);
  }

  const existingEpisode = await Episode.findOne({
    where: {
      podcastId,
      episodeNumber,
    },
  });

  if (existingEpisode) {
    throw createError('Número de episódio já existe neste podcast', 400);
  }

  const episode = await Episode.create({
    title,
    description,
    audioUrl,
    duration,
    episodeNumber,
    podcastId,
  });

  const episodeWithPodcast = await Episode.findByPk(episode.id, {
    include: [{
      model: Podcast,
      as: 'podcast',
      attributes: ['id', 'title', 'authorId'],
    }],
  });

  res.status(201).json({
    success: true,
    data: { episode: episodeWithPodcast },
  });
});

export const getEpisodes = asyncHandler(async (req: Request, res: Response) => {
  const { podcastId } = req.params;
  const { page = 1, limit = 10, published = 'all' } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const where: any = { podcastId };
  
  if (published === 'true') {
    where.isPublished = true;
  } else if (published === 'false') {
    where.isPublished = false;
  }

  const { count, rows: episodes } = await Episode.findAndCountAll({
    where,
    include: [{
      model: Podcast,
      as: 'podcast',
      attributes: ['id', 'title', 'authorId'],
    }],
    limit: Number(limit),
    offset,
    order: [['episodeNumber', 'ASC']],
  });

  res.json({
    success: true,
    data: {
      episodes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / Number(limit)),
      },
    },
  });
});

export const getEpisode = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const episode = await Episode.findByPk(id, {
    include: [
      {
        model: Podcast,
        as: 'podcast',
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email'],
        }],
      },
    ],
  });

  if (!episode) {
    throw createError('Episódio não encontrado', 404);
  }

  res.json({
    success: true,
    data: { episode },
  });
});

export const updateEpisode = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, audioUrl, duration, episodeNumber, isPublished } = req.body;

  const episode = await Episode.findByPk(id, {
    include: [{
      model: Podcast,
      as: 'podcast',
    }],
  });

  if (!episode) {
    throw createError('Episódio não encontrado', 404);
  }

  if (episode.podcast.authorId !== req.user.id && req.user.role !== 'admin') {
    throw createError('Acesso negado', 403);
  }

  if (episodeNumber && episodeNumber !== episode.episodeNumber) {
    const existingEpisode = await Episode.findOne({
      where: {
        podcastId: episode.podcastId,
        episodeNumber,
        id: { [Op.ne]: id },
      },
    });

    if (existingEpisode) {
      throw createError('Número de episódio já existe neste podcast', 400);
    }
  }

  await episode.update({
    title: title || episode.title,
    description: description || episode.description,
    audioUrl: audioUrl || episode.audioUrl,
    duration: duration || episode.duration,
    episodeNumber: episodeNumber || episode.episodeNumber,
    isPublished: isPublished !== undefined ? isPublished : episode.isPublished,
    publishedAt: isPublished && !episode.isPublished ? new Date() : episode.publishedAt,
  });

  const updatedEpisode = await Episode.findByPk(id, {
    include: [{
      model: Podcast,
      as: 'podcast',
      attributes: ['id', 'title', 'authorId'],
    }],
  });

  res.json({
    success: true,
    data: { episode: updatedEpisode },
  });
});

export const deleteEpisode = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const episode = await Episode.findByPk(id, {
    include: [{
      model: Podcast,
      as: 'podcast',
    }],
  });

  if (!episode) {
    throw createError('Episódio não encontrado', 404);
  }

  if (episode.podcast.authorId !== req.user.id && req.user.role !== 'admin') {
    throw createError('Acesso negado', 403);
  }

  await episode.destroy();

  res.json({
    success: true,
    message: 'Episódio excluído com sucesso',
  });
});

export const publishEpisode = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const episode = await Episode.findByPk(id, {
    include: [{
      model: Podcast,
      as: 'podcast',
    }],
  });

  if (!episode) {
    throw createError('Episódio não encontrado', 404);
  }

  if (episode.podcast.authorId !== req.user.id && req.user.role !== 'admin') {
    throw createError('Acesso negado', 403);
  }

  await episode.update({ 
    isPublished: true, 
    publishedAt: new Date() 
  });

  res.json({
    success: true,
    data: { episode },
  });
});
