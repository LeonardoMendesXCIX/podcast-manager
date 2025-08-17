const express = require('express');
const router = express.Router();
const podcastController = require('../controllers/podcastController');
const authMiddleware = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');

// Rotas públicas
router.get('/', podcastController.getAll);
router.get('/search', podcastController.search);
router.get('/:id', podcastController.getById);

// Rotas protegidas
router.post('/', authMiddleware, imageUpload.single('coverImage'), podcastController.create);
router.put('/:id', authMiddleware, imageUpload.single('coverImage'), podcastController.update);
router.delete('/:id', authMiddleware, podcastController.delete);
router.get('/user/my-podcasts', authMiddleware, podcastController.getUserPodcasts);

module.exports = router;
