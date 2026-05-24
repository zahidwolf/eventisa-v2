import { getApiBaseUrl } from "@/lib/api-base-url";
import type { HeroBanner } from "@/types/models/hero-banner";
import type { City } from "@/services/admin/cities.service";
import type { Venue } from "@/services/admin/venues.service";
import type { EventListItem } from "@/types/models/event";

export async function fetchPublicHeroBanners(): Promise<HeroBanner[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/public/hero-banners`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { banners?: HeroBanner[] } };
    return json.data?.banners ?? [];
  } catch {
    return [];
  }
}

export async function fetchPublicCities(): Promise<City[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/public/cities`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { cities?: City[] } };
    return json.data?.cities ?? [];
  } catch {
    return [];
  }
}

export async function fetchPublicVenues(city?: string): Promise<Venue[]> {
  try {
    const q = city ? `?city=${encodeURIComponent(city)}` : "";
    const res = await fetch(`${getApiBaseUrl()}/public/venues${q}`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { venues?: Venue[] } };
    return json.data?.venues ?? [];
  } catch {
    return [];
  }
}

export async function fetchCuratedTrendingEvents(): Promise<EventListItem[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/public/homepage/trending-events`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: { events?: EventListItem[] } };
    return json.data?.events ?? [];
  } catch {
    return [];
  }
}
