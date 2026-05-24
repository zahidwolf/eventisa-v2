export enum UploadType {
  EventBanner = "event-banner",
  OrganizerLogo = "organizer-logo",
  OrganizerBanner = "organizer-banner",
  SponsorLogo = "sponsor-logo",
  Document = "document",
  SpeakerImage = "speaker-image",
}

export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
export const ALLOWED_DOCUMENT_MIMES = ["application/pdf"] as const;

export const UPLOAD_TYPE_CONFIG: Record<
  UploadType,
  { mimes: readonly string[]; maxMb: number; isImage: boolean }
> = {
  [UploadType.EventBanner]: { mimes: ALLOWED_IMAGE_MIMES, maxMb: 5, isImage: true },
  [UploadType.OrganizerLogo]: { mimes: ALLOWED_IMAGE_MIMES, maxMb: 2, isImage: true },
  [UploadType.OrganizerBanner]: { mimes: ALLOWED_IMAGE_MIMES, maxMb: 5, isImage: true },
  [UploadType.SponsorLogo]: { mimes: ALLOWED_IMAGE_MIMES, maxMb: 2, isImage: true },
  [UploadType.SpeakerImage]: { mimes: ALLOWED_IMAGE_MIMES, maxMb: 3, isImage: true },
  [UploadType.Document]: {
    mimes: [...ALLOWED_IMAGE_MIMES, ...ALLOWED_DOCUMENT_MIMES],
    maxMb: 10,
    isImage: false,
  },
};

export const DANGEROUS_EXTENSIONS = [".exe", ".sh", ".bat", ".php", ".js", ".html", ".svg"] as const;

/** Cloudinary folder paths for curated image types. */
export const UPLOAD_TYPE_FOLDERS: Record<UploadType, string> = {
  [UploadType.EventBanner]: "events/banners",
  [UploadType.OrganizerLogo]: "organizers/logos",
  [UploadType.OrganizerBanner]: "organizers/covers",
  [UploadType.SponsorLogo]: "sponsors/logos",
  [UploadType.SpeakerImage]: "speakers/images",
  [UploadType.Document]: "documents",
};

export const FOLDER_TO_UPLOAD_TYPE: Partial<Record<string, UploadType>> = {
  "events/banners": UploadType.EventBanner,
  "organizers/logos": UploadType.OrganizerLogo,
  "organizers/covers": UploadType.OrganizerBanner,
};
