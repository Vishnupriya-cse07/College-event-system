// =================== ADMIN ROUTES ===================
const express = require('express');
const adminRouter = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');
const { Society, Registration, Notification } = require('../models/Models');
const { authenticate, authorize } = require('../middleware/auth');

const emitNotification = async (io, userId, notification) => {
  io?.to(`user:${userId}`).emit('notification:new', notification);
};

// Dashboard stats
adminRouter.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [totalEvents, pendingEvents, totalStudents, totalSocieties, totalRegistrations, upcomingEvents] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: 'student' }),
      Society.countDocuments(),
      Registration.countDocuments(),
      Event.countDocuments({ status: 'approved', date: { $gte: new Date() } }),
    ]);

    const recentEvents = await Event.find({ status: 'pending' })
      .populate('society', 'name logo')
      .sort({ createdAt: -1 })
      .limit(5);

    const categoryCounts = await Event.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const monthlyRegistrations = await Registration.aggregate([
      {
        $group: {
          _id: { month: { $month: '$registeredAt' }, year: { $year: '$registeredAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 },
    ]);

    res.json({
      success: true,
      stats: { totalEvents, pendingEvents, totalStudents, totalSocieties, totalRegistrations, upcomingEvents },
      recentEvents,
      categoryCounts,
      monthlyRegistrations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve/Reject event
adminRouter.put('/events/:id/review', authenticate, authorize('admin'), async (req, res) => {
  try {
    const io = req.app.get('io');
    const { status, adminNotes, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes, rejectionReason },
      { new: true }
    ).populate('organizer', '_id name').populate('society', 'name');

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const notifType = status === 'approved' ? 'event_approved' : 'event_rejected';
    const notifMessage = status === 'approved'
      ? `Your event "${event.title}" has been approved and is now live!`
      : `Your event "${event.title}" was rejected. ${rejectionReason || ''}`;

    const notification = await Notification.create({
      recipient: event.organizer._id,
      type: notifType,
      title: status === 'approved' ? '✅ Event Approved' : '❌ Event Rejected',
      message: notifMessage,
      data: { eventId: event._id },
    });

    await emitNotification(io, event.organizer._id.toString(), notification);

    if (status === 'approved') {
      // Notify students interested in this category
      const interestedStudents = await User.find({
        role: 'student',
        interests: event.category,
        isActive: true,
      }).select('_id');

      for (const student of interestedStudents) {
        const studentNotif = await Notification.create({
          recipient: student._id,
          type: 'new_event',
          title: '🎉 New Event for You!',
          message: `A new ${event.category} event "${event.title}" is now available!`,
          data: { eventId: event._id },
        });
        await emitNotification(io, student._id.toString(), studentNotif);
      }

      io?.to(`interest:${event.category}`).emit('event:new', event);
    }

    res.json({ success: true, event, message: `Event ${status} successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all pending events
adminRouter.get('/events/pending', authenticate, authorize('admin'), async (req, res) => {
  try {
    const events = await Event.find({ status: 'pending' })
      .populate('society', 'name logo category')
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Feature/Unfeature event
adminRouter.put('/events/:id/feature', authenticate, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { isFeatured: req.body.isFeatured },
      { new: true }
    );
    res.json({ success: true, event, message: `Event ${req.body.isFeatured ? 'featured' : 'unfeatured'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Manage users
adminRouter.get('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query)
      .populate('societyId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Toggle user active status
adminRouter.put('/users/:id/toggle', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify society
adminRouter.put('/societies/:id/verify', authenticate, authorize('admin'), async (req, res) => {
  try {
    const society = await Society.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    res.json({ success: true, society, message: 'Society verified' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = adminRouter;
