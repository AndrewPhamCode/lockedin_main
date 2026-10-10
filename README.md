# LockedIn

LockedIn is a focus timer and task list that pairs with an ESP32-controlled lock. You put your phone in the lock, list what you need to get done, and start a timer. The lock is designed to stay shut until the timer runs out or every task is checked off.

The project has three parts:

| Part | Location | What it does |
| --- | --- | --- |
| Web app | `/` (Vite + React) | Login, task list, focus timer, progress ring, profile and emergency unlock |
| API server | `/server` (Express + MongoDB) | Stores users and tasks |
| Lock firmware | Not in this repo | ESP32 that runs the countdown and drives the lock over a small HTTP API |

## Features

- **Accounts**: sign up with a name, email, password and a separate emergency unlock password. Logging in with an email that has no account creates one.
- **Tasks**: add, complete and delete tasks. Tasks are saved per user in MongoDB, so they are still there after you log out and back in.
- **Focus timer**: an analog clock with a digital readout. It starts at 30 minutes and adjusts in 5-minute steps, with a 30-minute minimum. Start, pause and resume are sent to the ESP32.
- **Progress ring**: shows completed tasks out of the total and turns green when everything is done.
- **Locked while running**: you cannot add or delete tasks while the timer is running.
- **Completion cooldown**: after checking off a task, you must wait 30 seconds before checking off another.
- **Emergency unlock**: from the profile screen, enter the emergency password to end the timer early.
- **Delete profile**: removes the account from the database.

## Tech stack

- **Frontend**: React 18, TypeScript, Vite 6, shadcn/ui (Radix UI), Tailwind CSS v4 (precompiled into `src/index.css`), lucide-react icons
- **Backend**: Node.js, Express 5, Mongoose 8, MongoDB (Atlas)
- **Hardware**: ESP32 on the same network as the browser

## How it fits together

```
Browser (http://localhost:3000)
  │
  ├── /api/*  ──(Vite dev proxy)──▶  Express server (http://localhost:4000)  ──▶  MongoDB
  │
  └── direct fetch  ──▶  ESP32 (http://172.20.10.8)  ──▶  lock
```

The browser talks to the ESP32 directly. The server never contacts the device.

## Getting started

### Prerequisites

- Node.js 18 or later (tested on Node 22)
- A MongoDB connection string, for example a free MongoDB Atlas cluster
- Optional: the ESP32 lock, flashed and on the same network as your computer

### 1. Clone and install

```bash
git clone https://github.com/AndrewPhamCode/lockedin_main.git
cd lockedin_main

npm install            # frontend
cd server
npm install            # backend
cd ..
```

### 2. Configure the server

Create `server/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/lockedin
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
```

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `MONGO_URI` | Yes | none | MongoDB connection string. The server exits on startup without it. |
| `PORT` | No | `4000` | Port the API listens on. The Vite proxy expects `4000`. |
| `CLIENT_ORIGIN` | No | `http://localhost:3000` | Origin allowed by CORS. |

`.env` files are git-ignored. Do not commit your connection string.

### 3. Run it

Use two terminals.

```bash
# Terminal 1: API server
cd server
npm run dev            # nodemon, restarts on change
```

```bash
# Terminal 2: web app
npm run dev            # opens http://localhost:3000
```

Check that the server is up and connected to the database:

```bash
curl http://localhost:4000/api/health
# {"ok":true,"db":"connected","now":"..."}
```

### 4. Connect the lock

The ESP32 address is hard-coded as `ESP_IP` in `src/components/AnalogClock.tsx` (and declared again, unused, in `src/components/TaskManager.tsx`). It is currently `http://172.20.10.8`. Change it to your device's address.

Without a reachable ESP32, the rest of the app works but **the timer will not start**, because Start only takes effect after the device accepts the request.

## Scripts

| Where | Command | What it does |
| --- | --- | --- |
| `/` | `npm run dev` | Start the Vite dev server on port 3000 with the `/api` proxy |
| `/` | `npm run build` | Build the frontend into `build/` |
| `/server` | `npm run dev` | Start the API with nodemon |
| `/server` | `npm start` | Start the API with node |

## API reference

Base URL: `http://localhost:4000`. All bodies are JSON.

### Health

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Returns `{ ok, db, now }`, where `db` is the MongoDB connection state |

### Users

| Method | Path | Body or query | Description |
| --- | --- | --- | --- |
| POST | `/api/users/login` | `{ name, email, password, emergencyPassword }` | Returns the user with that email, or creates one (201) if none exists |
| POST | `/api/users` | `{ name, email, password, emergencyPassword }` | Creates a user. All fields are required. |
| GET | `/api/users` | | Lists all users, newest first |
| GET | `/api/users/by-email` | `?email=` | Finds a user by email |
| GET | `/api/users/:id` | | Finds a user by id |
| DELETE | `/api/users/:email` | | Deletes a user by email |

### Tasks

| Method | Path | Body or query | Description |
| --- | --- | --- | --- |
| GET | `/api/tasks` | `?userId=` (optional) | Lists tasks, newest first, filtered by user if given |
| POST | `/api/tasks` | `{ userId, title }` | Creates a task |
| PATCH | `/api/tasks/:id` | `{ title?, completed? }` | Updates a task |
| DELETE | `/api/tasks/:id` | | Deletes a task. Returns `{ ok }`. |

### Data models

**User**: `name`, `email` (unique, lowercased), `password`, `emergencyPassword`, `createdAt`, `updatedAt`

**Task**: `userId` (reference to User), `title`, `completed` (default `false`), `createdAt`, `updatedAt`

## ESP32 interface

The firmware is not in this repo. The web app expects the device to serve these endpoints over HTTP and to send CORS headers, since the browser calls it from a different origin.

| Method | Path | Expected response | Used for |
| --- | --- | --- | --- |
| GET | `/status` | `{ "active": boolean, "paused": boolean, "remaining": seconds }` | Polled every 2 seconds to sync the on-screen timer |
| GET | `/start?duration=<seconds>` | any | Start the countdown and lock |
| GET | `/pause` | `{ "status": "paused" }` or `{ "status": "resumed" }` | Toggle pause |
| GET | `/stop` | any | Stop the countdown and release the lock |

## Project structure

```
lockedin_main/
├── index.html               # Vite entry HTML
├── vite.config.ts           # Dev server (port 3000), /api proxy, "@" alias to src/
├── package.json             # Frontend dependencies and scripts
├── src/
│   ├── main.tsx             # React entry point
│   ├── App.tsx              # Screen routing (login, tasks, profile) and shared timer state
│   ├── index.css            # Compiled Tailwind styles
│   ├── lib/api.ts           # Fetch wrapper for the backend
│   └── components/
│       ├── Login.tsx        # Login and sign-up tabs
│       ├── TaskManager.tsx  # Main screen: timer, progress, task list
│       ├── AnalogClock.tsx  # Timer UI and ESP32 calls
│       ├── CircularProgress.tsx
│       ├── Profile.tsx      # Emergency unlock, logout, delete profile
│       ├── Logo.tsx
│       ├── DailyStreak.tsx  # Not currently rendered
│       └── ui/              # shadcn/ui components
└── server/
    ├── package.json
    └── src/
        ├── index.js         # Express app and MongoDB connection
        ├── models/          # User.js, Task.js
        └── routes/          # health.js, users.js, tasks.js
```

`src/` also contains files left over from an earlier Next.js version (`src/app/`, `src/next.config.js`, `src/package.json`, `src/tsconfig.json`, `src/README.md`). The Vite build does not use them.

## Known limitations

This was built as a demo. Before using it for anything real:

- **No real authentication.** Passwords are stored in plain text and the login endpoint does not check them. Anyone who knows an email can log in as that user. The API has no sessions or tokens, and `GET /api/users` returns every user including passwords.
- **Emergency password is not read from the server.** After logging in through the Login tab, the emergency password is whatever account password was typed, not the one chosen at sign-up.
- **Emergency unlock and the all-tasks-done auto-stop do not reach the lock.** Both only reset the timer in the browser. Neither sends `/stop` to the ESP32, so with a device connected the next status poll can put the running timer back.
- **"Forgot password" is a placeholder.** The dialog validates the email and closes without sending anything.
- **Deleting a profile leaves its tasks** in the database.
- **The ESP32 address is hard-coded**, and the browser must be on the same network as the device.
- **The layout is desktop-only.**
- **There are no tests and no type-check or lint step.**

## Team

- Andrew Pham
- Jimbo Cai
- Justine Le
- Marcus Mendoza

## Credits

UI components from [shadcn/ui](https://ui.shadcn.com/) (MIT). The initial interface was generated from a Figma Make design.
