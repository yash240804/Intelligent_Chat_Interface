const { Schema, model } = require('mongoose');
const rsvp = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  eventId: { type: String, required: true },
  event: { title: String, venue: String, date: String, time: String, url: String, image: String },
  reminder: { enabled: { type: Boolean, default: true }, minutesBefore: { type: Number, default: 60 }, sentAt: Date },
}, { timestamps: true });
rsvp.index({ user: 1, eventId: 1 }, { unique: true });
module.exports = model('Rsvp', rsvp);
