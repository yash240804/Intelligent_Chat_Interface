const router = require('express').Router();
const crypto = require('crypto');
const Rsvp = require('../models/Rsvp');
const ShareLink = require('../models/ShareLink');
const auth = require('../middleware/auth');
const { friendCounts } = require('../services/friends');

router.use(auth);

// Generate (or reuse) a share link – only for events the user RSVP'd to
router.post('/:eventId', async (req, res, next) => {
  try {
    const rsvp = await Rsvp.findOne({ user: req.user._id, eventId: req.params.eventId });
    if (!rsvp) return res.status(403).json({ error: 'RSVP to this event before sharing it' });
    const link = await ShareLink.findOneAndUpdate(
      { owner: req.user._id, eventId: rsvp.eventId },
      { $setOnInsert: { token: crypto.randomBytes(6).toString('hex'), event: rsvp.event } },
      { upsert: true, new: true });
    const base = process.env.CLIENT_URL || 'http://localhost:5173';
    res.status(201).json({ token: link.token, url: `${base}/s/${link.token}`, clicks: link.clicks, uniqueFriends: link.visitors.length });
  } catch (e) { next(e); }
});

// A friend opens a link: count unique non-owner visitors
router.post('/:token/click', async (req, res, next) => {
  try {
    const link = await ShareLink.findOne({ token: req.params.token });
    if (!link) return res.status(404).json({ error: 'This invite link is not valid' });
    const own = link.owner.equals(req.user._id);
    if (!own) await ShareLink.updateOne({ _id: link._id }, { $inc: { clicks: 1 }, $addToSet: { visitors: req.user._id } });
    const counts = await friendCounts([link.eventId]);
    res.json({ own, eventId: link.eventId, event: link.event, friendsAttending: counts[link.eventId] || 0 });
  } catch (e) { next(e); }
});
module.exports = router;
