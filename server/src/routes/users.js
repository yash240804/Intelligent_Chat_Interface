const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

const ALLOWED = ['name', 'email', 'city', 'defaultReminderMinutes'];
const pick = (b) => Object.fromEntries(ALLOWED.filter((k) => b[k] !== undefined && b[k] !== '').map((k) => [k, b[k]]));

router.post('/', async (req, res, next) => {
  try { res.status(201).json(await User.create({ name: 'Guest', ...pick(req.body) })); } catch (e) { next(e); }
});
router.get('/me', auth, (req, res) => res.json(req.user));
router.put('/me', auth, async (req, res, next) => {
  try {
    const d = pick(req.body);
    if (d.defaultReminderMinutes !== undefined && ![15, 30, 60, 180, 1440].includes(Number(d.defaultReminderMinutes)))
      return res.status(400).json({ error: 'Unsupported reminder interval' });
    req.user.set(d); await req.user.save(); res.json(req.user);
  } catch (e) { next(e); }
});
module.exports = router;
