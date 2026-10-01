export default function EventCard({ event, onInterested, onShare }) {
  const when = new Date(`${event.date}T00:00:00`).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' });
  return (
    <article className={`card ${event.interested ? 'going' : ''}`}>
      <div className="when"><b>{when}</b><span>{event.time || 'Time TBA'}</span></div>
      <div className="what">
        <h3>{event.url ? <a href={event.url} target="_blank" rel="noreferrer">{event.title}</a> : event.title}</h3>
        <p>{event.venue}</p>
        <p className="friends">{event.friendsAttending > 0 ? `${event.friendsAttending} friend${event.friendsAttending > 1 ? 's' : ''} attending` : 'No friends yet'}</p>
      </div>
      <div className="acts">
        <button className={event.interested ? 'btn on' : 'btn'} onClick={() => onInterested(event)}>
          {event.interested ? 'Going' : 'Interested'}
        </button>
        {event.interested && <button className="btn ghost" onClick={() => onShare(event)}>Copy invite link</button>}
      </div>
    </article>
  );
}
