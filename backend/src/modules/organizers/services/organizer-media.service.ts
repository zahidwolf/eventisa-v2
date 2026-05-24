import { replaceMediaIfChanged } from "@/shared/upload/persist-media-image.js";
import { UPLOAD_TYPE_FOLDERS, UploadType } from "@/modules/uploads/constants/upload.constants.js";
import type { OrganizerDocument } from "@/modules/organizers/models/organizer.model.js";

export async function applyOrganizerLogo(
  organizer: OrganizerDocument,
  logo: string | undefined
) {
  if (logo === undefined) return;
  const result = await replaceMediaIfChanged(
    logo,
    organizer.logo,
    organizer.logoPublicId,
    UPLOAD_TYPE_FOLDERS[UploadType.OrganizerLogo]
  );
  organizer.logo = result.url;
  organizer.logoPublicId = result.publicId ?? undefined;
}

export async function applyOrganizerBanner(
  organizer: OrganizerDocument,
  coverPhoto: string | undefined
) {
  if (coverPhoto === undefined) return;
  const result = await replaceMediaIfChanged(
    coverPhoto,
    organizer.banner,
    organizer.bannerPublicId,
    UPLOAD_TYPE_FOLDERS[UploadType.OrganizerBanner]
  );
  organizer.banner = result.url;
  organizer.bannerPublicId = result.publicId ?? undefined;
}
