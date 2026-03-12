const express = require('express');
const router = express.Router();
const { registerForEvent, cancelRegistration, getMyRegistrations, getEventRegistrations } = require('../controllers/registrationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/event/:eventId', protect, authorize('student'), registerForEvent);
router.delete('/event/:eventId', protect, authorize('student'), cancelRegistration);
router.get('/my', protect, authorize('student'), getMyRegistrations);
router.get('/event/:eventId', protect, authorize('society', 'admin'), getEventRegistrations);

module.exports = router;
