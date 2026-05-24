"use client";

import { ImageUpload } from "@/components/media/image-upload";

interface MediaTabProps {
  coverImage: string;
  videoThumbnail: string;
  onCover: (v: string) => void;
  onVideo: (v: string) => void;
}

export function EventBuilderMediaTab({
  coverImage,
  videoThumbnail,
  onCover,
  onVideo,
}: MediaTabProps) {
  return (
    <div className="space-y-6">
      <ImageUpload label="Event banner" uploadType="event-banner" value={coverImage} onChange={onCover} />
      <ImageUpload
        label="Video thumbnail"
        uploadType="event-banner"
        value={videoThumbnail}
        onChange={onVideo}
        aspect="square"
      />
    </div>
  );
}
