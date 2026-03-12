const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password');
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/interests', protect, authorize('student'), async (req, res) => {
  try {
    const { interests } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { interests }, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
