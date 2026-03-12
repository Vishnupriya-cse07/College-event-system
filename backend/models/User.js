const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'society', 'student'], required: true },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },

  // Student-specific
  studentId: { type: String },
  department: { type: String },
  year: { type: Number },
  interests: [{ type: String }],
  registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],

  // Society-specific
  societyName: { type: String },
  societyDescription: { type: String },
  societyCategory: { type: String },
  societyLogo: { type: String },
  eventsOrganized: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],

  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
