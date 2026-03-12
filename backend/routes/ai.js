const express = require('express');
const router = express.Router();
const { getRecommendations, generateEventDescription, chatWithAI, analyzeEventSuccess } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

router.get('/recommendations', protect, authorize('student'), getRecommendations);
router.post('/generate-description', protect, authorize('society', 'admin'), generateEventDescription);
router.post('/chat', protect, chatWithAI);
router.get('/analyze/:eventId', protect, authorize('society', 'admin'), analyzeEventSuccess);

module.exports = router;
