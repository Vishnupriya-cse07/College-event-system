const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['confirmed', 'waitlisted', 'cancelled', 'attended'],
    default: 'confirmed'
  },
  registrationCode: { type: String, unique: true },
  attended: { type: Boolean, default: false },
  cancelledAt: { type: Date },
  cancelReason: { type: String }
}, { timestamps: true });

registrationSchema.index({ event: 1, student: 1 }, { unique: true });

registrationSchema.pre('save', function(next) {
  if (!this.registrationCode) {
    this.registrationCode = 'REG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Registration', registrationSchema);
