"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/services/uploads/uploads.service";
import { getApiErrorMessage } from "@/services/api/client";
import type { UploadType } from "@/constants/upload";
import { resolveUploadUrl } from "@/lib/media/resolve-upload-url";

type AspectRatio = "banner" | "square" | "cover";

interface ImageUploadProps {
  label?: string;
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
  uploadType?: UploadType;
  aspectRatio?: AspectRatio;
  /** @deprecated Use aspectRatio */
  aspect?: AspectRatio;
  maxSizeMB?: number;
  disabled?: boolean;
}

const ASPECT_CLASS: Record<AspectRatio, string> = {
  banner: "aspect-[16/9]",
  square: "aspect-square max-w-[200px]",
  cover: "aspect-[3/1]",
};

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function validateFile(file: File, maxSizeMB: number): string | null {
  if (!ACCEPTED.includes(file.type)) return "Use JPG, PNG, or WebP only";
  if (file.size > maxSizeMB * 1024 * 1024) return `Image must be ${maxSizeMB}MB or smaller`;
  return null;
}

export function ImageUpload({
  label,
  value,
  onChange,
  folder,
  uploadType = "event-banner",
  aspectRatio,
  aspect,
  maxSizeMB = 5,
  disabled = false,
}: ImageUploadProps) {
  const ratio = aspectRatio ?? aspect ?? "banner";
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(value ?? undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  useEffect(() => {
    setPreview(value ?? undefined);
  }, [value]);

  const runUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const res = await uploadFile(file, { uploadType, folder });
      const url = resolveUploadUrl(res.data.url);
      setPreview(url);
      onChange(url);
      setPendingFile(null);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (file: File) => {
    const err = validateFile(file, maxSizeMB);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setPendingFile(file);
    setPreview(URL.createObjectURL(file));
    await runUpload(file);
  };

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-zinc-300">{label}</p>}
      <div
        className={`relative overflow-hidden rounded-xl border border-dashed border-white/15 bg-surface-elevated/50 ${ASPECT_CLASS[ratio]}`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={label ?? "Upload preview"} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-600">
            <Upload className="h-8 w-8" />
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
            <span className="text-xs text-white">Uploading…</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        disabled={disabled || loading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = "";
        }}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || loading}
          onClick={() => inputRef.current?.click()}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload image"}
        </Button>
        {error && pendingFile && !loading && (
          <Button type="button" size="sm" variant="outline" onClick={() => void runUpload(pendingFile)}>
            Retry
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
