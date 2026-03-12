const express = require('express');
const router = express.Router();
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent, getSocietyEvents, submitFeedback } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getEvents);
router.get('/my-events', protect, authorize('society', 'admin'), getSocietyEvents);
router.get('/:id', getEvent);
router.post('/', protect, authorize('society', 'admin'), createEvent);
router.put('/:id', protect, authorize('society', 'admin'), updateEvent);
router.delete('/:id', protect, authorize('society', 'admin'), deleteEvent);
router.post('/:id/feedback', protect, authorize('student'), submitFeedback);

module.exports = router;
