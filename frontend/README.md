# Eventisa — Frontend

Next.js 15 App Router · TypeScript · Tailwind · Shadcn UI · Framer Motion

## Structure

- `src/app/` — one `page.tsx` per route (role-based route groups)
- `src/components/` — reusable UI by domain
- `src/services/` — API client layer (calls separate backend)
- `src/config/` — env, routes, site SEO
- `src/middleware.ts` — protected routes by role

## Absolute imports

`@/*` → `./src/*` (see `tsconfig.json`)

## Setup (when implementing)

```bash
cp .env.example .env.local
npm install
npx shadcn@latest init   # if not already configured
npm run dev
```

## Vercel

Deploy with root directory `frontend/`. Set `NEXT_PUBLIC_API_URL`.
