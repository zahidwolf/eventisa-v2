"use client";

import { useEffect, useRef, useState } from "react";
import type { SegmentStatus } from "@/lib/forms/form-field-types";

export type SegmentSaleState = "upcoming" | "active" | "soldout" | "expired";

export interface SegmentCountdownResult {
  state: SegmentSaleState;
  countdown: string | null;
}

function parseDate(value: Date | string | null | undefined): Date | null {
  if (value == null) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function resolveSegmentSaleState(
  now: number,
  saleStart: Date | null,
  saleEnd: Date | null,
  status: SegmentStatus | undefined,
  remainingQuantity: number
): SegmentCountdownResult {
  if (status === "soldout" || remainingQuantity <= 0) {
    return { state: "soldout", countdown: null };
  }

  const startMs = saleStart?.getTime() ?? null;
  const endMs = saleEnd?.getTime() ?? null;

  if (endMs != null && now > endMs) return { state: "expired", countdown: null };
  if (startMs != null && now < startMs) {
    return { state: "upcoming", countdown: formatCountdown(startMs - now) };
  }
  return { state: "active", countdown: null };
}

export function useSegmentCountdown({
  saleStart,
  saleEnd,
  status,
  remainingQuantity,
  onSaleActive,
}: {
  saleStart: Date | string | null;
  saleEnd: Date | string | null;
  status?: SegmentStatus;
  remainingQuantity: number;
  onSaleActive?: () => void;
}): SegmentCountdownResult {
  const start = parseDate(saleStart);
  const end = parseDate(saleEnd);
  const [mounted, setMounted] = useState(false);
  const [, setTick] = useState(0);
  const prevState = useRef<SegmentSaleState | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [mounted]);

  const result = resolveSegmentSaleState(Date.now(), start, end, status, remainingQuantity);

  useEffect(() => {
    if (prevState.current === "upcoming" && result.state === "active") {
      onSaleActive?.();
    }
    prevState.current = result.state;
  }, [result.state, onSaleActive]);

  // Avoid hydration mismatch: live countdown text differs between SSR and client.
  return {
    ...result,
    countdown: mounted ? result.countdown : null,
  };
}
