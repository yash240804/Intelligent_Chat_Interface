const BASE = import.meta.env.VITE_API_URL || '/api';

async function call(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-user-id': localStorage.getItem('uid') || '' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  createUser: (b) => call('/users', { method: 'POST', body: b }),
  me: () => call('/users/me'),
  updateMe: (b) => call('/users/me', { method: 'PUT', body: b }),
  events: (month) => call(`/events?month=${month}`),
  rsvps: () => call('/rsvps'),
  rsvp: (event) => call('/rsvps', { method: 'POST', body: { eventId: event.id, event } }),
  cancel: (id) => call(`/rsvps/${id}`, { method: 'DELETE' }),
  setReminder: (id, b) => call(`/rsvps/${id}/reminder`, { method: 'PUT', body: b }),
  due: () => call('/rsvps/due'),
  share: (id) => call(`/share/${id}`, { method: 'POST' }),
  click: (token) => call(`/share/${token}/click`, { method: 'POST' }),
};
