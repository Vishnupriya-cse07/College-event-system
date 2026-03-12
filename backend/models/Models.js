const mongoose = require('mongoose');

// ========== SOCIETY MODEL ==========
const societySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'technology', 'music', 'sports', 'arts', 'literature',
      'science', 'business', 'social', 'gaming', 'photography',
      'dance', 'drama', 'debate', 'environment', 'health', 'other'
    ],
  },
  logo: String,
  banner: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['president', 'secretary', 'treasurer', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  }],
  faculty_advisor: String,
  socialLinks: {
    instagram: String,
    twitter: String,
    linkedin: String,
    website: String,
  },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  totalEvents: { type: Number, default: 0 },
  totalMembers: { type: Number, default: 0 },
  foundedYear: Number,
  achievements: [String],
}, { timestamps: true });

// ========== REGISTRATION MODEL ==========
const registrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['confirmed', 'waitlisted', 'cancelled', 'attended'],
    default: 'confirmed',
  },
  ticketId: {
    type: String,
    unique: true,
  },
  attended: {
    type: Boolean,
    default: false,
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    submittedAt: Date,
  },
}, { timestamps: true });

// Generate unique ticket ID
registrationSchema.pre('save', function (next) {
  if (!this.ticketId) {
    this.ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

// Prevent duplicate registrations
registrationSchema.index({ event: 1, student: 1 }, { unique: true });

// ========== NOTIFICATION MODEL ==========
const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: [
      'event_approved', 'event_rejected', 'event_reminder',
      'registration_confirmed', 'registration_cancelled',
      'new_event', 'event_updated', 'event_cancelled',
      'system', 'ai_recommendation'
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society' },
    link: String,
  },
  isRead: { type: Boolean, default: false },
  readAt: Date,
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = {
  Society: mongoose.model('Society', societySchema),
  Registration: mongoose.model('Registration', registrationSchema),
  Notification: mongoose.model('Notification', notificationSchema),
};
