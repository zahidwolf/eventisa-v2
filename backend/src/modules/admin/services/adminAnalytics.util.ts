import NodeCache from "node-cache";

export const ALLOWED_ANALYTICS_DAYS = [7, 30, 90, 365] as const;
export type AnalyticsDays = (typeof ALLOWED_ANALYTICS_DAYS)[number];

export const overviewCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
export const seriesCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

export function parseAnalyticsDays(value: unknown): AnalyticsDays {
  const n = Number(value);
  return (ALLOWED_ANALYTICS_DAYS as readonly number[]).includes(n) ? (n as AnalyticsDays) : 30;
}

export function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function startOfLastMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}

export function endOfLastMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999);
}

export function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function growthPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function fillDailySeries<T extends { date: string }>(
  rows: T[],
  days: number,
  buildEmpty: (date: string) => T
): T[] {
  const map = new Map(rows.map((r) => [r.date, r]));
  const result: T[] = [];
  const cursor = daysAgo(days - 1);
  const end = startOfDay();
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    result.push(map.get(key) ?? buildEmpty(key));
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

export async function cached<T>(cache: NodeCache, key: string, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get<T>(key);
  if (hit !== undefined) return hit;
  const value = await fn();
  cache.set(key, value);
  return value;
}
