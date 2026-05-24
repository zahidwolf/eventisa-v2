import type { OfflineScan } from "@/types/checkIn.types";

const queueKey = (eventId: string) => `checkin_queue_${eventId}`;
const syncKey = (eventId: string) => `checkin_last_sync_${eventId}`;

export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("tick_checkin_device_id");
  if (!id) {
    id = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem("tick_checkin_device_id", id);
  }
  return id;
}

export function readQueue(eventId: string): OfflineScan[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(queueKey(eventId));
    return raw ? (JSON.parse(raw) as OfflineScan[]) : [];
  } catch {
    return [];
  }
}

export function writeQueue(eventId: string, scans: OfflineScan[]) {
  localStorage.setItem(queueKey(eventId), JSON.stringify(scans));
}

export function enqueueScan(eventId: string, scan: OfflineScan) {
  const q = readQueue(eventId);
  q.push(scan);
  writeQueue(eventId, q);
}

export function clearQueue(eventId: string) {
  localStorage.removeItem(queueKey(eventId));
}

export function getLastSyncTime(eventId: string): string | null {
  return localStorage.getItem(syncKey(eventId));
}

export function setLastSyncTime(eventId: string) {
  localStorage.setItem(syncKey(eventId), new Date().toISOString());
}
