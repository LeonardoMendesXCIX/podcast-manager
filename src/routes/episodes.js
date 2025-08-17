const express = require('express');
const router = express.Router();
const episodeController = require('../controllers/episodeController');
const authMiddleware = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');

// Rotas públicas
router.get('/podcast/:podcastId', episodeController.getByPodcast);
router.get('/:id', episodeController.getById);

// Rotas protegidas
router.post('/podcast/:podcastId', authMiddleware, imageUpload.single('audioFile'), episodeController.create);
router.put('/:id', authMiddleware, imageUpload.single('audioFile'), episodeController.update);
router.delete('/:id', authMiddleware, episodeController.delete);

module.exports = router;
