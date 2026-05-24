export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
}

const UTM_STORAGE_KEY = "eventisa_utm";

export function captureUtmFromUrl(): void {
  if (typeof window === "undefined") return;

  try {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source")?.trim();
    const medium = params.get("utm_medium")?.trim();
    const campaign = params.get("utm_campaign")?.trim();

    if (!source && !medium && !campaign) return;

    const payload: UtmParams = {
      source: source || undefined,
      medium: medium || undefined,
      campaign: campaign || undefined,
    };
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore storage errors */
  }
}

export function getStoredUtmParams(): UtmParams {
  if (typeof window === "undefined") return {};

  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as UtmParams;
    return {
      source: parsed.source?.trim() || undefined,
      medium: parsed.medium?.trim() || undefined,
      campaign: parsed.campaign?.trim() || undefined,
    };
  } catch {
    return {};
  }
}

export function clearStoredUtmParams(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(UTM_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
