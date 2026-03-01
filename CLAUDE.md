# ITU Calendar - Claude Instructions

## Deployment

**Platform:** Cloudflare Pages

| Environment | Branch | Project | URL |
|-------------|--------|---------|-----|
| Production | `main` | `itu-cal` | https://itucal.dk |
| Staging | `develop` | `itu-cal-dev` | https://dev.itucal.dk |

### Branching & CI
- **`main`** = production. Merges trigger deploy to itucal.dk.
- **`develop`** = staging. Merges trigger deploy to dev.itucal.dk.
- **Feature branches** are created from `develop`, merged back via PR.
- All PRs run CI (`.github/workflows/ci.yml`): lint, type-check, test, build.
- Both branches have branch protection: PRs required, `ci` status check must pass.

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
