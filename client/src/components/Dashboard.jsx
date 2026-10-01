const OPTIONS = [[15, '15 minutes'], [30, '30 minutes'], [60, '1 hour'], [180, '3 hours'], [1440, '1 day']];

export default function Dashboard({ rsvps, onReminder, onCancel, onShare }) {
  if (!rsvps.length) return <p className="empty">You haven't RSVP'd to anything yet. Press Interested on an event to add it here.</p>;
  return (
    <div className="list">
      {rsvps.map((r) => (
        <article className="card going" key={r.eventId}>
          <div className="when"><b>{r.event.date}</b><span>{r.event.time || 'Time TBA'}</span></div>
          <div className="what">
            <h3>{r.event.title}</h3>
            <p>{r.event.venue}</p>
            <p className="friends">{r.friendsAttending} friend{r.friendsAttending === 1 ? '' : 's'} attending</p>
          </div>
          <div className="acts">
            <label className="rem">
              <input type="checkbox" checked={r.reminder.enabled} onChange={(e) => onReminder(r.eventId, { enabled: e.target.checked })} />
              Remind me
              <select value={r.reminder.minutesBefore} disabled={!r.reminder.enabled} onChange={(e) => onReminder(r.eventId, { minutesBefore: +e.target.value })}>
                {OPTIONS.map(([v, l]) => <option key={v} value={v}>{l} before</option>)}
              </select>
            </label>
            <button className="btn ghost" onClick={() => onShare(r.event, r.eventId)}>Copy invite link</button>
            <button className="btn ghost danger" onClick={() => onCancel(r.eventId)}>Cancel RSVP</button>
          </div>
        </article>
      ))}
    </div>
  );
}
