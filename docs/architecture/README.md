# Architecture

## Overview

- **Frontend**: Next.js 15 App Router, feature-based components, dedicated API service layer.
- **Backend**: Express modular monolith — one folder per domain (`modules/*`).
- **Database**: MongoDB via Mongoose, localhost-first (`eventisa`).

## Frontend layers

| Layer | Path |
|-------|------|
| Pages (1 file per route) | `frontend/src/app/**/page.tsx` |
| UI components | `frontend/src/components/**` |
| API services | `frontend/src/services/**` |
| Config / SEO | `frontend/src/config`, `frontend/src/lib/seo` |
| Types | `frontend/src/types/**` |

## Backend layers

| Layer | Path |
|-------|------|
| Routes | `backend/src/modules/*/routes` |
| Controllers | `backend/src/modules/*/controllers` |
| Services | `backend/src/modules/*/services` |
| Models | `backend/src/modules/*/models` |
| Shared middleware | `backend/src/shared/middleware/**` |

## Role-based route groups (frontend)

- `(marketing)` — public SEO pages
- `(events)` — guest browsing
- `(auth)` — login/register
- `(user)` — authenticated buyers
- `(organizer)` — event creators
- `(admin)` — platform operators
