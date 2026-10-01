const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar({ month, dates, selected, onSelect, onMonth }) {
  const [y, m] = month.split('-').map(Number);
  const lead = new Date(y, m - 1, 1).getDay();
  const total = new Date(y, m, 0).getDate();
  const label = new Date(y, m - 1, 1).toLocaleString('en', { month: 'long', year: 'numeric' });
  const shift = (d) => onMonth(new Date(y, m - 1 + d, 1).toLocaleDateString('en-CA').slice(0, 7));
  const iso = (d) => `${month}-${String(d).padStart(2, '0')}`;

  return (
    <section className="cal" aria-label="Event calendar">
      <header>
        <button onClick={() => shift(-1)} aria-label="Previous month">‹</button>
        <h2>{label}</h2>
        <button onClick={() => shift(1)} aria-label="Next month">›</button>
      </header>
      <div className="grid">
        {DAYS.map((d) => <span key={d} className="dow">{d}</span>)}
        {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: total }, (_, i) => {
          const d = i + 1, key = iso(d), n = dates[key] || 0;
          return (
            <button key={key} disabled={!n} onClick={() => onSelect(selected === key ? null : key)}
              className={`day ${n ? 'has' : ''} ${selected === key ? 'on' : ''}`}
              aria-label={n ? `${key}: ${n} events` : key}>
              {d}{n > 0 && <i>{n}</i>}
            </button>
          );
        })}
      </div>
      {selected && <button className="link" onClick={() => onSelect(null)}>Show the whole month</button>}
    </section>
  );
}
