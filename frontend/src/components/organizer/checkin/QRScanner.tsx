"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { toast } from "sonner";
import { scanTicket, type CheckInApiScope } from "@/services/checkIn.service";
import {
  enqueueScan,
  getDeviceId,
} from "@/components/organizer/checkin/checkin-queue.util";
import type { CheckInResult } from "@/types/checkIn.types";

interface QRScannerProps {
  eventId: string;
  apiScope?: CheckInApiScope;
  onResult: (result: CheckInResult) => void;
}

export function QRScanner({ eventId, apiScope = "organizer", onResult }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const cooldownRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  const handleDecode = useCallback(
    async (text: string) => {
      if (cooldownRef.current) return;
      cooldownRef.current = true;
      setTimeout(() => {
        cooldownRef.current = false;
      }, 2000);

      const deviceId = getDeviceId();
      const online = typeof navigator !== "undefined" ? navigator.onLine : true;

      if (!online) {
        enqueueScan(eventId, {
          qrPayload: text,
          deviceId,
          scannedAt: new Date().toISOString(),
        });
        toast.info("Offline — scan queued for sync");
        onResult({
          status: "success",
          attendeeName: "Queued",
          segmentName: "—",
          ticketId: "",
          scannedAt: new Date().toISOString(),
          message: "Saved offline",
        });
        return;
      }

      try {
        const result = await scanTicket(eventId, text, deviceId, apiScope);
        onResult(result);
      } catch {
        onResult({
          status: "invalid",
          attendeeName: "—",
          segmentName: "—",
          ticketId: "",
          scannedAt: new Date().toISOString(),
          message: "Scan failed",
        });
      }
    },
    [eventId, onResult]
  );

  useEffect(() => {
    let cancelled = false;
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (cancelled || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setActive(true);
        setError(null);

        reader.decodeFromVideoDevice(undefined, videoRef.current, (res, err) => {
          if (res) void handleDecode(res.getText());
          if (err && !(err as { name?: string }).name?.includes("NotFound")) {
            /* continuous scan noise */
          }
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Camera access denied");
        setActive(false);
      }
    }

    void start();

    return () => {
      cancelled = true;
      const video = videoRef.current;
      const stream = video?.srcObject as MediaStream | null;
      stream?.getTracks().forEach((t) => t.stop());
      if (video) video.srcObject = null;
      readerRef.current = null;
    };
  }, [handleDecode]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black aspect-[3/4] max-h-[70vh]">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        playsInline
        muted
        autoPlay
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-48 w-48 rounded-2xl border-2 border-accent-magenta/70 shadow-[0_0_30px_rgba(255,62,165,0.35)]" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-center">
        {error ? (
          <p className="text-sm text-red-300">{error}</p>
        ) : (
          <p className="text-sm text-zinc-300">
            {active ? "Point camera at ticket QR — auto scan" : "Starting camera…"}
          </p>
        )}
      </div>
    </div>
  );
}
