const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const authMiddleware = require('../middleware/auth');

// Rotas protegidas
router.post('/:podcastId', authMiddleware, favoriteController.addFavorite);
router.delete('/:podcastId', authMiddleware, favoriteController.removeFavorite);
router.get('/', authMiddleware, favoriteController.getUserFavorites);
router.post('/toggle/:podcastId', authMiddleware, favoriteController.toggleFavorite);

module.exports = router;
