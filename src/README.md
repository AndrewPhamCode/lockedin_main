# LockedIn - Task Management App

A Next.js task management application with focus timer and progress tracking.

## Features

- **User Authentication**: Login and signup with comprehensive password validation
- **Task Management**: Create, complete, and delete tasks
- **Focus Timer**: 30-minute countdown timer with analog clock display
- **Progress Tracking**: Visual progress indicators with circular progress bars
- **Emergency Unlock**: Separate emergency password system
- **Previous Tasks**: View history of completed tasks
- **Profile Management**: Manage user settings and emergency password

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Project Structure

```
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page (main app)
│   └── globals.css     # Global styles
├── components/
│   ├── AnalogClock.tsx
│   ├── CircularProgress.tsx
│   ├── Login.tsx
│   ├── Logo.tsx
│   ├── Profile.tsx
│   ├── TaskManager.tsx
│   └── ui/             # Shadcn UI components
└── public/             # Static assets
```

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Icons**: Lucide React

## Build for Production

```bash
npm run build
npm start
```

## License

MIT
