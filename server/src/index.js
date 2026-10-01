require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/users', require('./routes/users'));
app.use('/api/events', require('./routes/events'));
app.use('/api/rsvps', require('./routes/rsvps'));
app.use('/api/share', require('./routes/share'));

app.use((err, _req, res, _next) => {
  if (err.name === 'ValidationError') err.status = 400;
  res.status(err.status || 500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventpulse')
  .then(() => app.listen(PORT, () => console.log(`API on :${PORT}`)))
  .catch((e) => { console.error('Mongo connection failed:', e.message); process.exit(1); });
