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

## API Integration

Update API base URL in `.env` and API functions in `src/services/api.ts` to connect with your backend. Each domain has its own service file (e.g. `buildingApi.ts`, `energyMeterApi.ts`) with corresponding TypeScript types in `src/services/types/`.
