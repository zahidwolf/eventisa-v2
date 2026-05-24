# Role system

| Role | Enum value | Typical access |
|------|------------|----------------|
| Guest | `guest` | Browse events, marketing, search |
| User | `user` | Purchase tickets, orders, profile |
| Organizer | `organizer` | CRUD events, ticket tiers, payouts |
| Admin | `admin` | Users, organizers, platform settings |

## Frontend

- Constants: `frontend/src/constants/roles.ts`
- Route groups: `(user)`, `(organizer)`, `(admin)`
- Middleware matcher: `frontend/src/middleware.ts`

## Backend

- Enum: `backend/src/shared/enums/role.enum.ts`
- RBAC middleware: `backend/src/shared/middleware/rbac/`
