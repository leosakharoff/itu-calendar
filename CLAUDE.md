# ITU Calendar - Claude Instructions

## Deployment

**Platform:** Cloudflare Pages
**Project name:** `itu-cal`
**Live URLs:**
- https://itucal.dk (primary)
- https://itu-cal.pages.dev

### Automatic Deployment
Pushes to `main` trigger GitHub Actions workflow (`.github/workflows/deploy.yml`) which deploys to Cloudflare Pages automatically.

### Manual Deployment
```bash
npm run build
npx wrangler pages deploy dist --project-name=itu-cal
```

## Tech Stack
- React 19 + TypeScript
- Vite 7
- Supabase (database)
- vite-plugin-pwa (PWA support)

## PWA
The app is a Progressive Web App. Users can install it on mobile via "Add to Home Screen" in Safari/Chrome.

- Manifest configured in `vite.config.ts`
- iOS meta tags in `index.html`
- Offline indicator component shows when disconnected
- Supabase API calls cached with NetworkFirst strategy
