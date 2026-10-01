const router = require('express').Router();
const mongoose = require('mongoose');
const { fetchEvents } = require('../services/ticketmaster');
const { friendCounts } = require('../services/friends');
const Rsvp = require('../models/Rsvp');
const User = require('../models/User');

router.get('/', async (req, res, next) => {
  try {
    const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(req.query.month || '') ? req.query.month : new Date().toISOString().slice(0, 7);
    const uid = req.get('x-user-id');
    const valid = uid && mongoose.isValidObjectId(uid);
    const user = valid ? await User.findById(uid) : null;
    const city = (req.query.city || user?.city || process.env.DEFAULT_CITY || 'Pune').toString().slice(0, 60);

    const events = await fetchEvents({ month, city });
    const counts = await friendCounts(events.map((e) => e.id));
    const mine = user
      ? new Set((await Rsvp.find({ user: uid, eventId: { $in: events.map((e) => e.id) } }, 'eventId')).map((r) => r.eventId))
      : new Set();

    const out = events.map((e) => ({ ...e, friendsAttending: counts[e.id] || 0, interested: mine.has(e.id) }));
    const dates = {};
    out.forEach((e) => { dates[e.date] = (dates[e.date] || 0) + 1; });
    res.json({ month, city, events: out, dates });
  } catch (e) { next(e); }
});
module.exports = router;
