/**
 * One-time migration: move base64 images in MongoDB to Cloudinary.
 * Run: npm run migrate:images
 */
import "dotenv/config";
import mongoose from "mongoose";
import { Event } from "../src/modules/events/models/event.model.js";
import { Organizer } from "../src/modules/organizers/models/organizer.model.js";
import { uploadConfig } from "../src/config/upload.config.js";
import { uploadFromBase64 } from "../src/shared/upload/cloudinary.service.js";
import { UPLOAD_TYPE_FOLDERS, UploadType } from "../src/modules/uploads/constants/upload.constants.js";

const BATCH = 5;
const DELAY_MS = 500;

function isBase64Image(value?: string | null): boolean {
  return !!value?.startsWith("data:image/");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function migrateBatch<T extends { _id: mongoose.Types.ObjectId }>(
  label: string,
  items: T[],
  migrateOne: (item: T) => Promise<"migrated" | "skipped" | "failed">
) {
  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Processing ${label}...`);
  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH);
    for (const item of batch) {
      try {
        const result = await migrateOne(item);
        if (result === "migrated") {
          migrated += 1;
          console.log(`${label} [${item._id}]: migrated`);
        } else if (result === "skipped") {
          skipped += 1;
          console.log(`${label} [${item._id}]: skipped (already URL)`);
        }
      } catch (err) {
        failed += 1;
        console.error(`${label} [${item._id}]: failed`, err);
      }
    }
    if (i + BATCH < items.length) await sleep(DELAY_MS);
  }
  return { migrated, skipped, failed };
}

async function main() {
  if (uploadConfig.provider !== "cloudinary") {
    console.error("Set UPLOAD_PROVIDER=cloudinary before running migration.");
    process.exit(1);
  }

  const uri = process.env.MONGO_URI ?? process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/eventisa";
  await mongoose.connect(uri);

  const events = await Event.find({
    coverImage: { $regex: /^data:image\// },
  }).select("_id coverImage coverImagePublicId");

  const eventStats = await migrateBatch("Event", events, async (event) => {
    if (!isBase64Image(event.coverImage)) return "skipped";
    const uploaded = await uploadFromBase64(
      event.coverImage!,
      UPLOAD_TYPE_FOLDERS[UploadType.EventBanner]
    );
    event.coverImage = uploaded.url;
    event.coverImagePublicId = uploaded.publicId;
    await event.save();
    return "migrated";
  });

  const organizers = await Organizer.find({
    $or: [{ logo: { $regex: /^data:image\// } }, { banner: { $regex: /^data:image\// } }],
  }).select("_id logo logoPublicId banner bannerPublicId");

  let orgMigrated = 0;
  let orgSkipped = 0;
  let orgFailed = 0;

  console.log("Processing organizers...");
  for (let i = 0; i < organizers.length; i += BATCH) {
    const batch = organizers.slice(i, i + BATCH);
    for (const org of batch) {
      try {
        let changed = false;
        if (isBase64Image(org.logo)) {
          const uploaded = await uploadFromBase64(
            org.logo!,
            UPLOAD_TYPE_FOLDERS[UploadType.OrganizerLogo]
          );
          org.logo = uploaded.url;
          org.logoPublicId = uploaded.publicId;
          changed = true;
          console.log(`Organizer [${org._id}]: migrated logo`);
        }
        if (isBase64Image(org.banner)) {
          const uploaded = await uploadFromBase64(
            org.banner!,
            UPLOAD_TYPE_FOLDERS[UploadType.OrganizerBanner]
          );
          org.banner = uploaded.url;
          org.bannerPublicId = uploaded.publicId;
          changed = true;
          console.log(`Organizer [${org._id}]: migrated cover photo`);
        }
        if (changed) {
          await org.save();
          orgMigrated += 1;
        } else {
          orgSkipped += 1;
          console.log(`Organizer [${org._id}]: skipped (already URL)`);
        }
      } catch (err) {
        orgFailed += 1;
        console.error(`Organizer [${org._id}]: failed`, err);
      }
    }
    if (i + BATCH < organizers.length) await sleep(DELAY_MS);
  }

  console.log(
    `Done: events ${eventStats.migrated} migrated, ${eventStats.skipped} skipped, ${eventStats.failed} failed; ` +
      `organizers ${orgMigrated} migrated, ${orgSkipped} skipped, ${orgFailed} failed`
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
