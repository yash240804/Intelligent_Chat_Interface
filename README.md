# EventPulse – find events, RSVP, invite friends

Full-stack event tracker. 
**Backend:** Node/Express + MongoDB (Mongoose) + Ticketmaster Discovery API.
**Frontend:** React (Vite). All business logic (validation, reminder timing, friend counts, calendar aggregation) lives on the server.

## Run
```bash
# 1. backend
cd server && cp .env.example .env   # add TICKETMASTER_API_KEY + MONGO_URI
npm install && npm start            # http://localhost:5000
# 2. frontend
cd client && npm install && npm run dev   # http://localhost:5173 (proxies /api)
```
Without a Ticketmaster key the server serves clearly-labelled sample events so the app still demos.

## API
| Method | Path | Purpose |
|---|---|---|
| POST | /api/users | create profile (returns `_id`, used as `x-user-id`) |
| GET/PUT | /api/users/me | read / update profile + default reminder |
| GET | /api/events?month=YYYY-MM&city= | Ticketmaster feed + calendar date counts + friendsAttending |
| GET/POST | /api/rsvps | list / create RSVP ("Interested") |
| DELETE | /api/rsvps/:eventId | cancel RSVP |
| PUT | /api/rsvps/:eventId/reminder | reminder settings |
| GET | /api/rsvps/due | reminders that are due now |
| POST | /api/share/:eventId | generate share link (requires RSVP) |
| POST | /api/share/:token/click | record unique friend click |

## Friend invite flow
RSVP → "Share link" → `/s/<token>`. A friend opening it is recorded once per user (owner clicks ignored); the unique-visitor total across links for an event is shown as **Friends attending**.

## Environment Setup

To run EventPulse with live event data and database persistence, you will need a Ticketmaster Developer API key and a MongoDB URI.

### 1. Ticketmaster API Key
1. Go to the [Ticketmaster Developer Portal](https://developer.ticketmaster.com/) and register for a free account.
   - *Note: If asked for company details during sign-up, you can enter "Personal Project" and use `http://localhost:5173` or your GitHub URL.*
2. Navigate to your **Dashboard** -> **My Apps** and select your app (or click **Create New App**).
3. Copy the **Consumer Key** listed under your app details.

### 2. MongoDB Setup
You can use a free cloud database via MongoDB Atlas or run MongoDB locally.

#### Option A: MongoDB Atlas (Recommended Cloud Database)
1. Sign up for a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create an **M0 Free Cluster**.
2. Under **Database Access**, create a database user (username and password).
3. Under **Network Access**, add IP address `0.0.0.0/0` (Allows access from anywhere for local testing).
4. Go to **Clusters** -> **Connect** -> **Drivers (Node.js)** and copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/eventpulse?retryWrites=true&w=majority