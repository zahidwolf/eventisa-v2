# Eventisa — Backend

Node.js · Express · MongoDB · Mongoose

## Structure

Modular clean architecture under `src/modules/`:

```
modules/<domain>/
  routes/
  controllers/
  services/
  models/
  validators/
  types/
  dtos/
```

Shared cross-cutting concerns: `src/shared/`

## Absolute imports

`@/*` → `./src/*` (see `tsconfig.json`)

## Local MongoDB

```bash
cp .env.example .env
# MONGODB_URI=mongodb://localhost:27017/eventisa
npm install
npm run dev
```
