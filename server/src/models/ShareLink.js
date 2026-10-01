const { Schema, model } = require('mongoose');
const link = new Schema({
  token: { type: String, required: true, unique: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: String, required: true, index: true },
  event: { title: String, venue: String, date: String, time: String, url: String, image: String },
  clicks: { type: Number, default: 0 },          // total opens by non-owners
  visitors: [{ type: Schema.Types.ObjectId }],   // unique friends who opened the link
}, { timestamps: true });
link.index({ owner: 1, eventId: 1 }, { unique: true });
module.exports = model('ShareLink', link);
