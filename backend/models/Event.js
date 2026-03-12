const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  shortDescription: { type: String },
  category: {
    type: String,
    enum: ['technical', 'cultural', 'sports', 'academic', 'workshop', 'seminar', 'hackathon', 'other'],
    required: true
  },
  tags: [{ type: String }],
  
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  date: { type: Date, required: true },
  endDate: { type: Date },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  isOnline: { type: Boolean, default: false },
  onlineLink: { type: String },
  
  maxParticipants: { type: Number, default: 100 },
  registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  waitlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  registrationDeadline: { type: Date },
  registrationOpen: { type: Boolean, default: true },
  
  banner: { type: String, default: '' },
  images: [{ type: String }],
  
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'published'
  },
  
  prizes: [{ position: String, reward: String }],
  requirements: [{ type: String }],
  speakers: [{ name: String, designation: String, bio: String }],
  schedule: [{ time: String, activity: String }],
  
  aiEmbedding: [{ type: Number }],
  viewCount: { type: Number, default: 0 },
  
  feedback: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

eventSchema.virtual('registrationCount').get(function() {
  return this.registeredStudents.length;
});

eventSchema.virtual('availableSlots').get(function() {
  return this.maxParticipants - this.registeredStudents.length;
});

eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
