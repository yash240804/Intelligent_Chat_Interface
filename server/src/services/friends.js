const ShareLink = require('../models/ShareLink');

// eventId -> number of unique friends who opened any share link for it
async function friendCounts(eventIds) {
  if (!eventIds.length) return {};
  const rows = await ShareLink.aggregate([
    { $match: { eventId: { $in: eventIds } } },
    { $unwind: '$visitors' },
    { $group: { _id: { e: '$eventId', v: '$visitors' } } },
    { $group: { _id: '$_id.e', n: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [r._id, r.n]));
}
module.exports = { friendCounts };
