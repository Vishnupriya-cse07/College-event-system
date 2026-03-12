const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const societies = await User.find({ role: 'society', isActive: true })
      .select('name societyName societyDescription societyCategory societyLogo eventsOrganized avatar');
    res.json({ success: true, societies });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const society = await User.findById(req.params.id)
      .select('-password')
      .populate('eventsOrganized');
    if (!society) return res.status(404).json({ message: 'Society not found' });
    res.json({ success: true, society });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
