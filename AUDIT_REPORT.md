# Codebase Audit Report

Date: May 24, 2026

## Security Findings

### Hardcoded secrets found

**None** in application source (`backend/src`, `frontend/src`). Secrets are read via `process.env` (e.g. `JWT_ACCESS_SECRET`, `CLOUDINARY_API_KEY`, SMTP credentials).

- `backend/scripts/seed.ts` uses demo password `Password123` for seeded accounts only (documented in README) — intentional, not production config.

### Hardcoded localhost URLs

**No changes required** — localhost/127.0.0.1 appear only as **development fallbacks** when env vars are unset:

| Location | Pattern |
|----------|---------|
| `frontend/src/config/env.ts` | `process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"` |
| `frontend/src/lib/api-base-url.ts` | `process.env.API_URL_INTERNAL ?? … ?? "http://127.0.0.1:5001/api"` |
| `backend/src/shared/email/email.config.ts` | `FRONTEND_URL ?? CLIENT_URL ?? "http://localhost:3000"` |
| `backend/src/modules/payments/services/gatewayRouter.service.ts` | Fallback API base using `process.env.PORT` |
| `backend/src/server.ts` | Startup log `http://localhost:${env.PORT}` |
| Model defaults / seed / placeholders | Dev-only defaults in MongoDB schema and docs |

These match README local-dev setup; production should set env vars in deployment.

### Sensitive console.logs removed

| Count | Detail |
|-------|--------|
| **2** | `backend/src/shared/email/email.service.ts` — no longer logs recipient email or SMTP username |

**Kept (allowed):** SMTP skip/connected/failed messages, event reminder job start/skip, `console.error` for failures, Winston `logger` usage, server startup logs.

---

## Backend Cleanup

| Item | Count / detail |
|------|----------------|
| Unused imports removed | **~28** across 22 files (ESLint `@typescript-eslint/no-unused-vars`) |
| Unused variables addressed | **6** (`void` for intentional omit destructuring; unused `event` in `adminResendConfirmationEmail`) |
| Unused functions removed | **None** (no zero-reference exports found) |
| Empty files removed | **None** |
| Console.logs removed | **2** (sensitive); **5** retained (SMTP/job startup — allowed) |
| Commented-out code removed | **0** blocks (none found that duplicated live code) |
| Unused models removed | **None** |

### Files touched (backend)

`admin-auth.service.ts`, `admin-dashboard.service.ts`, `admin-management.service.ts`, `adminEventDetail.service.ts`, `admin-cache.util.ts`, `admin-settings.controller.ts`, `auth.routes.ts`, `auth.service.ts`, `checkin.routes.ts`, `admin-event.controller.ts`, `admin-event-list.service.ts`, `organizer-event-list.service.ts`, `checkIn.service.ts`, `admin-event.validator.ts`, `order.model.ts`, `organizer.controller.ts`, `organizer.service.ts`, `organizerSettings.service.ts`, `base-payment.provider.ts`, `payment-gateway.routes.ts`, `payout.helpers.ts`, `ticket.routes.ts`, `authenticate.middleware.ts`, `organizer-event.service.ts`, `email.service.ts`

### Pre-existing ESLint (not changed — would alter patterns)

- `@typescript-eslint/no-namespace` on `authenticate.middleware.ts` and `admin-authenticate.middleware.ts` (Express `Request` augmentation).

---

## Frontend Cleanup

| Item | Count / detail |
|------|----------------|
| Unused imports removed | **3** (`Mic2`, `PartyPopper` in `event-categories.ts`; `Link` in `verify-email/page.tsx`) |
| Unused components removed | **2** — `cities-section.tsx`, `organizers-venues-section.tsx` (zero imports; removed from homepage earlier) |
| Unused hooks removed | **None** |
| Unused utilities removed | **None** |
| Console.logs removed | **0** (no `console.log` in `frontend/src`) |
| Commented-out JSX removed | **0** |

### Not removed (intentional / needs product decision)

- Placeholder routes (`RoutePlaceholder`) — still valid URLs, not dead code.
- ESLint warnings for React hooks deps, unused vars in checkout mock page, admin analytics — left unchanged to avoid behavior risk.

---

## Possibly Unused Packages

**Not auto-removed.** Flag for manual review:

- Run `npx depcheck` in `backend/` and `frontend/` before removing any dependency.
- Some packages are used only in config, scripts, or transitive tooling.

---

## TODOs Found

**11** intentional notes (not removed):

| File | Topic |
|------|--------|
| `backend/src/modules/tickets/services/ticket-reservation.service.ts` | Cron for reservation expiry |
| `backend/src/index.ts` | Dedicated cron worker |
| `backend/src/modules/payments/providers/sslcommerz.provider.ts` | Validation API |
| `backend/src/modules/payments/controllers/webhook.controller.ts` | SSLCommerz / bKash / Nagad webhooks |
| `backend/src/config/payment.config.ts` | Live gateway env vars |
| `backend/src/shared/constants/redis.placeholder.ts` | Redis integration |
| `frontend/src/services/api/client.ts` | Auth redirect on 401 |
| `frontend/src/components/seo/event-tracking-scripts.tsx` | Gate on admin approval flag |
| `frontend/src/app/(auth)/forgot-password/page.tsx` | Wire forgot-password API |

---

## Possibly Unused .env Variables

**Not exhaustively scanned.** Notable in `backend/.env.example`:

- `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX_REQUESTS` appear **twice** (duplicate lines) — consolidate in `.env.example` when editing env docs.
- Commented `REDIS_URL` — documented as future use in `redis.placeholder.ts`.

---

## Verification

| Check | Result |
|-------|--------|
| `cd backend && npm run build` | **Pass** |
| `cd backend && npm run typecheck` | **Pass** |
| `cd frontend && npm run build` | **Fail** — Google Fonts fetch (`Inter`) during build (network/environment; unrelated to cleanup) |
| `cd frontend && npm run typecheck` | **Fail** — pre-existing errors in organizer wizard, user dashboard nav, order/ticket components |
| `cd backend && npm run lint` | **2 errors** (namespace), **4 warnings** (`_cover` omit pattern resolved with `void` where applied) |

---

## What Was NOT Changed

- All API endpoints and route registrations
- All business logic and response shapes
- UI component behavior and props
- Database schemas and models
- Payment, auth, checkout, and email verification flows
- Homepage, hero, footer, contact page, and navigation features
