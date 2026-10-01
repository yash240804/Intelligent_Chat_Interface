import { useCallback, useEffect, useState } from 'react';
import { api } from './api.js';
import Calendar from './components/Calendar.jsx';
import EventCard from './components/EventCard.jsx';
import Dashboard from './components/Dashboard.jsx';
import Profile from './components/Profile.jsx';

const thisMonth = () => new Date().toLocaleDateString('en-CA').slice(0, 7);

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('discover');
  const [month, setMonth] = useState(thisMonth());
  const [feed, setFeed] = useState({ events: [], dates: {}, city: '' });
  const [sel, setSel] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [invite, setInvite] = useState(null);
  const [toast, setToast] = useState('');
  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 4000); };

  // bootstrap identity + handle /s/:token friend invites
  useEffect(() => {
    (async () => {
      try {
        let u = null;
        if (localStorage.getItem('uid')) u = await api.me().catch(() => null);
        if (!u) { u = await api.createUser({ name: 'Guest' }); localStorage.setItem('uid', u._id); }
        setUser(u);
        const m = location.pathname.match(/^\/s\/(\w+)/);
        if (m) { setInvite(await api.click(m[1])); history.replaceState(null, '', '/'); }
      } catch (e) { flash(e.message); }
    })();
  }, []);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [f, r] = await Promise.all([api.events(month), api.rsvps()]);
      setFeed(f); setRsvps(r);
    } catch (e) { flash(e.message); }
  }, [user, month]);

  useEffect(() => { load(); }, [load]);

  // near-real-time: refresh friend counts and check due reminders
  useEffect(() => {
    if (!user) return;
    const t = setInterval(async () => {
      load();
      const due = await api.due().catch(() => []);
      due.forEach((d) => flash(`Reminder: ${d.title} on ${d.date} ${d.time || ''}`));
    }, 20000);
    return () => clearInterval(t);
  }, [user, load]);

  const interested = async (e) => {
    try {
      if (e.interested) await api.cancel(e.id); else await api.rsvp(e);
      await load();
    } catch (err) { flash(err.message); }
  };
  const share = async (event, id = event.id) => {
    try {
      const { url } = await api.share(id);
      await navigator.clipboard.writeText(url).catch(() => {});
      flash(`Invite link copied: ${url}`);
    } catch (err) { flash(err.message); }
  };
  const reminder = async (id, b) => { try { await api.setReminder(id, b); load(); } catch (e) { flash(e.message); } };
  const cancel = async (id) => { await api.cancel(id); load(); };
  const saveProfile = async (b) => {
    try { setUser(await api.updateMe(b)); flash('Profile saved'); load(); } catch (e) { flash(e.message); }
  };

  const shown = sel ? feed.events.filter((e) => e.date === sel) : feed.events;

  return (
    <div className="app">
      <header className="top">
        <h1>EventPulse</h1>
        <nav>
          {[['discover', 'Discover'], ['rsvps', `My RSVPs (${rsvps.length})`], ['profile', 'Profile']].map(([k, l]) => (
            <button key={k} className={tab === k ? 'tab on' : 'tab'} onClick={() => setTab(k)}>{l}</button>
          ))}
        </nav>
      </header>

      {invite && (
        <aside className="invite">
          <p>{invite.own ? 'This is your own invite link.' : `A friend invited you to ${invite.event.title}.`} {invite.friendsAttending} friend{invite.friendsAttending === 1 ? '' : 's'} attending so far.</p>
          <button className="link" onClick={() => setInvite(null)}>Dismiss</button>
        </aside>
      )}

      {tab === 'discover' && (
        <main className="split">
          <Calendar month={month} dates={feed.dates} selected={sel} onSelect={setSel} onMonth={(m) => { setMonth(m); setSel(null); }} />
          <section className="list">
            <p className="meta">{shown.length} event{shown.length === 1 ? '' : 's'} in {feed.city || 'your city'}{sel ? ` on ${sel}` : ''}</p>
            {shown.length === 0 && <p className="empty">No events found for this month. Try another month or change your city in Profile.</p>}
            {shown.map((e) => <EventCard key={e.id} event={e} onInterested={interested} onShare={share} />)}
          </section>
        </main>
      )}
      {tab === 'rsvps' && <main><Dashboard rsvps={rsvps} onReminder={reminder} onCancel={cancel} onShare={share} /></main>}
      {tab === 'profile' && user && <main><Profile user={user} onSave={saveProfile} /></main>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
