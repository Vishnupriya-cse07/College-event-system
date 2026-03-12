const Event = require('../models/Event');
const User = require('../models/User');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');

exports.getEvents = async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 12, upcoming } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    else query.status = { $in: ['published', 'ongoing'] };
    if (upcoming === 'true') query.date = { $gte: new Date() };
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
    
    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name societyName societyLogo avatar')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.json({ success: true, events, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name societyName societyLogo societyDescription avatar')
      .populate('registeredStudents', 'name email avatar department year');
    
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    event.viewCount += 1;
    await event.save();
    
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const eventData = { ...req.body, organizer: req.user._id };
    const event = await Event.create(eventData);
    
    await User.findByIdAndUpdate(req.user._id, {
      $push: { eventsOrganized: event._id }
    });
    
    // Notify all students
    const students = await User.find({ role: 'student', isActive: true });
    const notifications = students.map(student => ({
      recipient: student._id,
      sender: req.user._id,
      type: 'new_event',
      title: 'New Event Posted!',
      message: `${req.user.societyName || req.user.name} has posted a new event: ${event.title}`,
      event: event._id
    }));
    
    const createdNotifs = await Notification.insertMany(notifications);
    
    // Real-time notification via Socket.io
    students.forEach(student => {
      req.io.to(`user_${student._id}`).emit('new_notification', {
        type: 'new_event',
        title: 'New Event!',
        message: `New event: ${event.title}`,
        event: event._id
      });
    });
    
    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name societyName avatar');
    
    req.io.emit('event_created', populatedEvent);
    
    res.status(201).json({ success: true, event: populatedEvent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('organizer', 'name societyName avatar');
    
    // Notify registered students
    const registrations = await Registration.find({ event: event._id, status: 'confirmed' });
    const notifications = registrations.map(reg => ({
      recipient: reg.student,
      type: 'event_updated',
      title: 'Event Updated',
      message: `Event "${event.title}" has been updated. Check the latest details.`,
      event: event._id
    }));
    await Notification.insertMany(notifications);
    
    registrations.forEach(reg => {
      req.io.to(`user_${reg.student}`).emit('new_notification', {
        type: 'event_updated',
        message: `Event "${event.title}" has been updated`
      });
    });
    
    req.io.emit('event_updated', updated);
    res.json({ success: true, event: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Registration.deleteMany({ event: event._id });
    await Event.findByIdAndDelete(req.params.id);
    
    req.io.emit('event_deleted', { eventId: req.params.id });
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSocietyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .populate('registeredStudents', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    event.feedback.push({ student: req.user._id, rating, comment });
    await event.save();
    
    res.json({ success: true, message: 'Feedback submitted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
