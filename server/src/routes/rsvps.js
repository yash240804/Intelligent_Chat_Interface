const router = require('express').Router();
const Rsvp = require('../models/Rsvp');
const auth = require('../middleware/auth');
const { friendCounts } = require('../services/friends');

const INTERVALS = [15, 30, 60, 180, 1440];
router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    const rows = await Rsvp.find({ user: req.user._id }).lean();
    rows.sort((a, b) => `${a.event.date}${a.event.time || ''}`.localeCompare(`${b.event.date}${b.event.time || ''}`));
    const counts = await friendCounts(rows.map((r) => r.eventId));
    res.json(rows.map((r) => ({ ...r, friendsAttending: counts[r.eventId] || 0 })));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { eventId, event } = req.body;
    if (!eventId || !event?.title || !/^\d{4}-\d{2}-\d{2}$/.test(event.date || ''))
      return res.status(400).json({ error: 'eventId, event.title and event.date (YYYY-MM-DD) are required' });
    const { title, venue, date, time, url, image } = event;
    const doc = await Rsvp.findOneAndUpdate(
      { user: req.user._id, eventId },
      { $setOnInsert: { event: { title, venue, date, time, url, image }, 'reminder.enabled': true, 'reminder.minutesBefore': req.user.defaultReminderMinutes } },
      { upsert: true, new: true });
    res.status(201).json(doc);
  } catch (e) { next(e); }
});

// Reminders whose time has arrived (computed server-side, marked sent once returned)
router.get('/due', async (req, res, next) => {
  try {
    const now = Date.now();
    const rows = await Rsvp.find({ user: req.user._id, 'reminder.enabled': true, 'reminder.sentAt': null });
    const due = rows.filter((r) => {
      const start = new Date(`${r.event.date}T${r.event.time || '09:00'}:00`).getTime();
      return start > now && start - r.reminder.minutesBefore * 60000 <= now;
    });
    await Rsvp.updateMany({ _id: { $in: due.map((d) => d._id) } }, { 'reminder.sentAt': new Date() });
    res.json(due.map((d) => ({ eventId: d.eventId, title: d.event.title, date: d.event.date, time: d.event.time })));
  } catch (e) { next(e); }
});

router.put('/:eventId/reminder', async (req, res, next) => {
  try {
    const { enabled, minutesBefore } = req.body;
    if (minutesBefore !== undefined && !INTERVALS.includes(Number(minutesBefore)))
      return res.status(400).json({ error: `minutesBefore must be one of ${INTERVALS.join(', ')}` });
    const set = { 'reminder.sentAt': null };
    if (enabled !== undefined) set['reminder.enabled'] = !!enabled;
    if (minutesBefore !== undefined) set['reminder.minutesBefore'] = Number(minutesBefore);
    const doc = await Rsvp.findOneAndUpdate({ user: req.user._id, eventId: req.params.eventId }, set, { new: true });
    if (!doc) return res.status(404).json({ error: 'RSVP not found' });
    res.json(doc);
  } catch (e) { next(e); }
});

router.delete('/:eventId', async (req, res, next) => {
  try { await Rsvp.deleteOne({ user: req.user._id, eventId: req.params.eventId }); res.status(204).end(); } catch (e) { next(e); }
});
module.exports = router;
