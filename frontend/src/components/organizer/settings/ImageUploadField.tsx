"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { fileToBase64, validateImageFile } from "@/lib/image-base64";

interface ImageUploadFieldProps {
  label: string;
  currentUrl?: string;
  onPick: (base64: string | undefined) => void;
  circle?: boolean;
  buttonLabel?: string;
}

export function ImageUploadField({ label, currentUrl, onPick, circle, buttonLabel = "Change Photo" }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(currentUrl);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    const err = validateImageFile(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    const base64 = await fileToBase64(file);
    onPick(base64);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-zinc-400">{label}</p>
      <div className="flex items-center gap-4">
        <div
          className={`relative overflow-hidden border border-white/10 bg-white/5 ${
            circle ? "h-20 w-20 rounded-full" : "h-24 w-40 rounded-xl"
          }`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-zinc-600">No image</span>
          )}
        </div>
        <Button type="button" variant="outline" className="border-white/15" onClick={() => inputRef.current?.click()}>
          {buttonLabel}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
