import { useState } from 'react';

export default function Profile({ user, onSave }) {
  const [f, setF] = useState({ name: user.name || '', email: user.email || '', city: user.city || '', defaultReminderMinutes: user.defaultReminderMinutes || 60 });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="profile">
      <label>Name<input value={f.name} onChange={set('name')} maxLength={60} /></label>
      <label>Email<input type="email" value={f.email} onChange={set('email')} /></label>
      <label>City for event search<input value={f.city} onChange={set('city')} placeholder="e.g. Mumbai" /></label>
      <label>Default reminder
        <select value={f.defaultReminderMinutes} onChange={set('defaultReminderMinutes')}>
          {[[15, '15 minutes'], [30, '30 minutes'], [60, '1 hour'], [180, '3 hours'], [1440, '1 day']].map(([v, l]) => <option key={v} value={v}>{l} before</option>)}
        </select>
      </label>
      <button className="btn on" onClick={() => onSave({ ...f, defaultReminderMinutes: +f.defaultReminderMinutes })}>Save profile</button>
    </div>
  );
}
