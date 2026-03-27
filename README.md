# Smart Home Dashboard

A comprehensive smart building management dashboard built with React, TypeScript, Ant Design, and ECharts.

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | TypeScript check + Vite build |
| `npm run build:vercel` | Vite build only (for Vercel deploy) |
| `npm run typecheck` | Run TypeScript compiler check |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:coverage` | Run unit tests with coverage output |
| `npm run test:e2e` | Run Playwright e2e smoke tests |
| `npm run test:e2e:ui` | Run Playwright UI mode |

## API Integration

Update API base URL in `.env` and API functions in `src/services/api.ts` to connect with your backend. Each domain has its own service file (e.g. `buildingApi.ts`, `energyMeterApi.ts`) with corresponding TypeScript types in `src/services/types/`.

## Auth Strategy

- `VITE_AUTH_STRATEGY=bearer_memory` (recommended default): access token kept in memory, refresh via cookie endpoint.
- `VITE_AUTH_STRATEGY=cookie`: cookie-only session, no bearer token attached from JS.
- Legacy localStorage token strategy has been removed.
