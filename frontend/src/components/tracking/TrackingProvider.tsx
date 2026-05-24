"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initPixel, pageView } from "@/lib/tracking/metaPixel";
import {
  fetchTrackingConfig,
  injectGoogleAnalytics,
  injectGoogleTagManager,
} from "@/lib/tracking/analytics-scripts";
import { captureUtmFromUrl } from "@/lib/tracking/utmTracker";

function isBuyerFacingPath(pathname: string): boolean {
  if (pathname.startsWith("/admin")) return false;
  if (
    pathname.startsWith("/organizer/") &&
    !pathname.startsWith("/organizer/login") &&
    !pathname.startsWith("/organizer/register")
  ) {
    return false;
  }
  return true;
}

export function TrackingProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isBuyerFacingPath(pathname)) return;

    captureUtmFromUrl();

    void fetchTrackingConfig().then((config) => {
      if (config.metaPixelId) initPixel(config.metaPixelId);
      if (config.googleAnalyticsId) injectGoogleAnalytics(config.googleAnalyticsId);
      if (config.googleTagManagerId) injectGoogleTagManager(config.googleTagManagerId);
    });
  }, [pathname]);

  useEffect(() => {
    if (!isBuyerFacingPath(pathname)) return;
    pageView();
  }, [pathname]);

  return null;
}
