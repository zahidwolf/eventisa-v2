# Deployment

## Frontend (Vercel)

- Root directory: `frontend/`
- Framework: Next.js
- Region suggestion: `sin1` (Singapore — low latency to Bangladesh)
- Set `NEXT_PUBLIC_API_URL` to production backend URL

## Backend (separate host)

- Deploy `backend/` to any Node host (Railway, Render, AWS, DigitalOcean, etc.)
- Set `MONGODB_URI` to managed MongoDB (Atlas recommended for production)
- Set `CORS_ORIGIN` to Vercel frontend URL

## Local MongoDB

```bash
mongod --dbpath ./data/db
# Connection: mongodb://localhost:27017/eventisa
```
