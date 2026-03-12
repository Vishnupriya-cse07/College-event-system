const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(decoded.id).select('-password');
        socket.user = user;
      }
      next();
    } catch (err) {
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    if (socket.user) {
      socket.join(`user_${socket.user._id}`);
    }

    socket.on('join_event', (eventId) => { socket.join(`event_${eventId}`); });
    socket.on('leave_event', (eventId) => { socket.leave(`event_${eventId}`); });

    socket.on('admin_broadcast', (data) => {
      if (socket.user?.role === 'admin') io.emit('system_announcement', data);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
