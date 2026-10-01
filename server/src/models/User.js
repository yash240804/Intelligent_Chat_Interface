const { Schema, model } = require('mongoose');
module.exports = model('User', new Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  city: { type: String, trim: true, maxlength: 60 },
  defaultReminderMinutes: { type: Number, default: 60 },
}, { timestamps: true }));
