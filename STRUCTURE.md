# Eventisa — Complete Folder Structure

```
Tick/
├── README.md
├── STRUCTURE.md
├── .gitignore
│
├── docs/
│   ├── architecture/README.md
│   ├── api/README.md
│   ├── deployment/README.md
│   └── roles/README.md
│
├── scripts/
│   └── README.md
│
├── frontend/                          # Next.js 15 → Vercel
│   ├── README.md
│   ├── package.json
│   ├── tsconfig.json                  # @/* absolute imports
│   ├── next.config.ts
│   ├── next-env.d.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── components.json                # Shadcn UI
│   ├── eslint.config.mjs
│   ├── .prettierrc
│   ├── .prettierignore
│   ├── .env.example
│   ├── .env.local.example
│   ├── vercel.json
│   │
│   ├── public/
│   │   ├── images/events|avatars|placeholders/
│   │   ├── fonts/
│   │   └── icons/
│   │
│   └── src/
│       ├── middleware.ts              # Role route guards (pending)
│       ├── styles/globals.css
│       │
│       ├── app/                       # App Router — 1 page per file
│       │   ├── layout.tsx
│       │   ├── page.tsx               # Home
│       │   ├── loading.tsx | error.tsx | global-error.tsx | not-found.tsx
│       │   ├── robots.ts | sitemap.ts | manifest.ts
│       │   ├── opengraph-image.tsx | twitter-image.tsx
│       │   ├── help/page.tsx | support/page.tsx
│       │   │
│       │   ├── (marketing)/           # Guest — SEO pages
│       │   │   ├── layout.tsx
│       │   │   ├── about/page.tsx
│       │   │   ├── contact/page.tsx
│       │   │   ├── faq/page.tsx
│       │   │   ├── how-it-works/page.tsx
│       │   │   ├── terms/page.tsx
│       │   │   ├── privacy/page.tsx
│       │   │   └── refund-policy/page.tsx
│       │   │
│       │   ├── (auth)/
│       │   │   ├── layout.tsx
│       │   │   ├── login/page.tsx
│       │   │   ├── register/page.tsx
│       │   │   ├── forgot-password/page.tsx
│       │   │   ├── reset-password/page.tsx
│       │   │   └── verify-email/page.tsx
│       │   │
│       │   ├── (events)/              # Guest — browse & discover
│       │   │   ├── layout.tsx
│       │   │   ├── events/page.tsx | events/loading.tsx
│       │   │   ├── events/[slug]/page.tsx | loading.tsx
│       │   │   ├── events/[slug]/tickets/page.tsx
│       │   │   ├── categories/page.tsx | categories/[slug]/page.tsx
│       │   │   ├── search/page.tsx
│       │   │   └── venues/page.tsx | venues/[slug]/page.tsx
│       │   │
│       │   ├── (checkout)/            # Guest/User — purchase flow
│       │   │   ├── layout.tsx
│       │   │   ├── cart/page.tsx
│       │   │   ├── checkout/page.tsx
│       │   │   ├── checkout/success/page.tsx
│       │   │   └── checkout/failed/page.tsx
│       │   │
│       │   ├── (user)/                # Role: user
│       │   │   ├── layout.tsx
│       │   │   ├── dashboard/page.tsx
│       │   │   ├── tickets/page.tsx | tickets/[id]/page.tsx
│       │   │   ├── orders/page.tsx | orders/[id]/page.tsx
│       │   │   ├── profile/page.tsx
│       │   │   ├── settings/page.tsx
│       │   │   ├── notifications/page.tsx
│       │   │   └── wishlist/page.tsx
│       │   │
│       │   ├── (organizer)/           # Role: organizer
│       │   │   ├── layout.tsx
│       │   │   └── organizer/
│       │   │       ├── dashboard/page.tsx
│       │   │       ├── events/page.tsx | create/page.tsx
│       │   │       ├── events/[id]/page.tsx | edit/page.tsx | tickets/page.tsx
│       │   │       ├── tickets/page.tsx
│       │   │       ├── orders/page.tsx
│       │   │       ├── analytics/page.tsx
│       │   │       ├── payouts/page.tsx
│       │   │       ├── settings/page.tsx
│       │   │       └── team/page.tsx
│       │   │
│       │   └── (admin)/               # Role: admin
│       │       ├── layout.tsx
│       │       └── admin/
│       │           ├── dashboard/page.tsx
│       │           ├── users/page.tsx | users/[id]/page.tsx
│       │           ├── organizers/page.tsx | organizers/[id]/page.tsx
│       │           ├── events/page.tsx | events/[id]/page.tsx
│       │           ├── orders/page.tsx
│       │           ├── payments/page.tsx
│       │           ├── reports/page.tsx
│       │           ├── settings/page.tsx
│       │           └── audit-logs/page.tsx
│       │
│       ├── components/                # Reusable UI
│       │   ├── ui/                    # Shadcn primitives
│       │   ├── layout/header|footer|sidebar|navigation|breadcrumbs/
│       │   ├── common/ | seo/ | forms/ | animations/
│       │   ├── events/ | tickets/ | checkout/
│       │   ├── auth/ | user/ | organizer/ | admin/ | marketing/
│       │
│       ├── services/                  # API service layer → backend
│       │   ├── api/client.ts
│       │   ├── auth/ | events/ | tickets/ | orders/
│       │   ├── payments/ | users/ | organizer/ | admin/
│       │
│       ├── hooks/auth/ | hooks/events/
│       ├── lib/utils.ts | lib/seo/metadata.ts | lib/validators/ | lib/auth/
│       ├── config/env.ts | site.ts | routes.ts
│       ├── constants/roles.ts
│       ├── types/api/ | types/models/
│       ├── context/ | providers/ | store/
│
└── backend/                           # Express — separate deploy
    ├── README.md
    ├── package.json
    ├── tsconfig.json                  # @/* absolute imports
    ├── eslint.config.mjs
    ├── .prettierrc | .prettierignore
    ├── .env.example                   # mongodb://localhost:27017/eventisa
    │
    ├── src/
    │   ├── index.ts | app.ts | server.ts
    │   ├── config/env.ts
    │   ├── database/migrations/ | seeders/
    │   ├── routes/v1/index.ts         # Route aggregator
    │   │
    │   ├── modules/                   # Feature modules (clean arch)
    │   │   ├── auth/
    │   │   ├── users/
    │   │   ├── events/
    │   │   ├── tickets/
    │   │   ├── orders/
    │   │   ├── payments/
    │   │   ├── organizers/
    │   │   ├── admin/
    │   │   ├── notifications/
    │   │   ├── uploads/
    │   │   ├── analytics/
    │   │   └── audit/
    │   │       └── each: routes/ controllers/ services/
    │   │                    models/ validators/ types/ dtos/
    │   │
    │   └── shared/
    │       ├── constants/
    │       ├── enums/role.enum.ts     # admin | organizer | user | guest
    │       ├── errors/
    │       ├── middleware/auth|rbac|validation|error-handler|rate-limit/
    │       ├── utils/ | validators/ | types/ | logger/
    │
    └── tests/unit/ | integration/ | e2e/ | fixtures/
```

## Role mapping

| Role | Frontend route group | Backend RBAC |
|------|---------------------|--------------|
| `guest` | `(marketing)`, `(events)`, `(checkout)` (browse) | `Role.Guest` |
| `user` | `(user)` | `Role.User` |
| `organizer` | `(organizer)` | `Role.Organizer` |
| `admin` | `(admin)` | `Role.Admin` |

## Next steps (when ready)

1. `npm install` in `frontend/` and `backend/`
2. Add dependencies (Next 15, Express, Mongoose, Shadcn, Framer Motion)
3. Implement modules starting with `auth` → `events` → `tickets` → `orders`
