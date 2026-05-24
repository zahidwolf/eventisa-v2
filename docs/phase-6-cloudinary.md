# Cloudinary integration (production uploads)

1. Set `UPLOAD_PROVIDER=cloudinary` in backend `.env`
2. Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
3. Optional: `CLOUDINARY_FOLDER=eventisa` (root folder prefix in Cloudinary)
4. SDK: `cloudinary` (installed in backend)

## Upload API

`POST /api/uploads?folder=events/banners` or `?type=event-banner`  
Multipart field: `file` (jpg/jpeg/png/webp, max 5MB for image types)  
Auth: any logged-in user (`authenticate` middleware)

Returns `{ url, publicId, uploadType, provider }`.

Local dev keeps `UPLOAD_PROVIDER=local` and serves files at `/api/uploads/files/*`.

## Cloudinary folders

```
{CLOUDINARY_FOLDER}/
  events/banners/      ← event cover/banner
  organizers/logos/    ← organizer logo
  organizers/covers/   ← organizer cover photo
```

## Migration

One-time script for legacy base64 rows in MongoDB:

```bash
cd backend && npm run migrate:images
```

Requires `UPLOAD_PROVIDER=cloudinary` and valid Cloudinary credentials.
