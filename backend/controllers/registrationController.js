const Registration = require('../models/Registration');
const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (!event.registrationOpen) return res.status(400).json({ message: 'Registration is closed' });
    
    const existing = await Registration.findOne({ event: event._id, student: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already registered' });
    
    const isFull = event.registeredStudents.length >= event.maxParticipants;
    const status = isFull ? 'waitlisted' : 'confirmed';
    
    const registration = await Registration.create({
      event: event._id,
      student: req.user._id,
      status
    });
    
    if (!isFull) {
      await Event.findByIdAndUpdate(event._id, {
        $push: { registeredStudents: req.user._id }
      });
      await User.findByIdAndUpdate(req.user._id, {
        $push: { registeredEvents: event._id }
      });
    } else {
      await Event.findByIdAndUpdate(event._id, {
        $push: { waitlist: req.user._id }
      });
    }
    
    const notification = await Notification.create({
      recipient: req.user._id,
      type: 'event_registered',
      title: status === 'confirmed' ? 'Registration Confirmed!' : 'Added to Waitlist',
      message: status === 'confirmed'
        ? `You have successfully registered for "${event.title}". Your registration code: ${registration.registrationCode}`
        : `You have been added to the waitlist for "${event.title}"`,
      event: event._id
    });
    
    req.io.to(`user_${req.user._id}`).emit('new_notification', {
      type: 'event_registered',
      title: notification.title,
      message: notification.message
    });
    
    req.io.to(`event_${event._id}`).emit('registration_update', {
      eventId: event._id,
      count: event.registeredStudents.length + 1
    });
    
    res.status(201).json({ success: true, registration, status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findOne({
      event: req.params.eventId,
      student: req.user._id
    });
    
    if (!registration) return res.status(404).json({ message: 'Registration not found' });
    
    registration.status = 'cancelled';
    registration.cancelledAt = new Date();
    await registration.save();
    
    await Event.findByIdAndUpdate(req.params.eventId, {
      $pull: { registeredStudents: req.user._id, waitlist: req.user._id }
    });
    
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { registeredEvents: req.params.eventId }
    });
    
    // Promote from waitlist
    const event = await Event.findById(req.params.eventId);
    if (event && event.waitlist.length > 0) {
      const nextStudent = event.waitlist[0];
      await Registration.findOneAndUpdate(
        { event: event._id, student: nextStudent, status: 'waitlisted' },
        { status: 'confirmed' }
      );
      await Event.findByIdAndUpdate(event._id, {
        $push: { registeredStudents: nextStudent },
        $pull: { waitlist: nextStudent }
      });
      
      const notif = await Notification.create({
        recipient: nextStudent,
        type: 'waitlist_promoted',
        title: 'You got a spot!',
        message: `A spot opened up for "${event.title}". You are now confirmed!`,
        event: event._id
      });
      
      req.io.to(`user_${nextStudent}`).emit('new_notification', {
        type: 'waitlist_promoted',
        title: notif.title,
        message: notif.message
      });
    }
    
    res.json({ success: true, message: 'Registration cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate({
        path: 'event',
        populate: { path: 'organizer', select: 'name societyName avatar' }
      })
      .sort({ createdAt: -1 });
    
    res.json({ success: true, registrations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('student', 'name email studentId department year avatar');
    
    res.json({ success: true, registrations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
