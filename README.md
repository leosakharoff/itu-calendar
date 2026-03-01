# ITU Calendar

A semester calendar for IT University of Copenhagen students. Track lectures, deadlines, exams, presentations, and more across your courses.

**Live:** [itucal.dk](https://itucal.dk) | **Staging:** [dev.itucal.dk](https://dev.itucal.dk)

## Features

- Multi-course calendar with color-coded event dots
- Event types: lecture, deliverable, exam, presentation, meeting, holiday
- Drag-and-drop event rescheduling (desktop + mobile long-press)
- Course sharing via invite links (copy or live sync)
- Discord and email notifications for upcoming events
- Installable PWA with offline support
- Danish and English language support

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Database:** Supabase (PostgreSQL + Auth)
- **Hosting:** Cloudflare Pages
- **PWA:** vite-plugin-pwa with NetworkFirst caching

## Development

```bash
npm install
npm run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests (Vitest) |

### Environment Variables

Create a `.env.local` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Deployment

Deployed via Cloudflare Pages with automatic builds on push.

| Environment | Branch | URL |
|-------------|--------|-----|
| Production | `main` | [itucal.dk](https://itucal.dk) |
| Staging | `develop` | [dev.itucal.dk](https://dev.itucal.dk) |

Feature branches are created from `develop` and merged back via PR. All PRs run CI (lint, type-check, test, build).

## Database

Supabase with PostgreSQL. Schema migrations live in `supabase/migrations/`. Key tables: `courses`, `events`, `shared_calendars`, `subscriptions`, `notification_settings`, `user_settings`.
