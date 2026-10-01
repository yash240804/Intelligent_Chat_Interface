const BASE = 'https://app.ticketmaster.com/discovery/v2/events.json';

const normalize = (e) => ({
  id: e.id,
  title: e.name,
  venue: e._embedded?.venues?.[0]?.name || 'Venue TBA',
  date: e.dates?.start?.localDate,
  time: e.dates?.start?.localTime?.slice(0, 5) || null,
  url: e.url,
  image: e.images?.[0]?.url || null,
});

function sampleEvents(month, city) {
  const names = ['Indie Night Live', 'Street Food Festival', 'Stand-up Showcase', 'Tech Meetup', 'Classical Evening', 'Art Walk', 'Open Mic', 'Cricket Fan Zone'];
  return names.map((n, i) => ({
    id: `sample-${month}-${i}`, title: n, venue: `${city} Arena ${i + 1}`,
    date: `${month}-${String(3 + i * 3).padStart(2, '0')}`, time: `${18 + (i % 4)}:00`, url: null, image: null, sample: true,
  }));
}

async function fetchEvents({ month, city }) {
  const [y, m] = month.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) return sampleEvents(month, city);
  const qs = new URLSearchParams({
    apikey: key, city, size: '100', sort: 'date,asc',
    startDateTime: `${month}-01T00:00:00Z`, endDateTime: `${month}-${last}T23:59:59Z`,
  });
  const res = await fetch(`${BASE}?${qs}`);
  if (!res.ok) throw Object.assign(new Error(`Ticketmaster error ${res.status}`), { status: 502 });
  const json = await res.json();
  return (json._embedded?.events || []).map(normalize).filter((e) => e.date);
}

module.exports = { fetchEvents };
