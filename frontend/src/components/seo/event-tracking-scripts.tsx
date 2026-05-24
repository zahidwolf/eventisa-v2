"use client";

import Script from "next/script";

interface EventTrackingProps {
  metaPixel?: { enabled?: boolean; pixelId?: string; googleAnalyticsId?: string };
}

/**
 * Injects organizer tracking when event is approved (pixelId set by admin/organizer).
 * TODO: Gate on admin approval flag from API when exposed.
 */
export function EventTrackingScripts({ metaPixel }: EventTrackingProps) {
  if (!metaPixel?.enabled) return null;
  if (!metaPixel?.pixelId && !metaPixel?.googleAnalyticsId) return null;

  return (
    <>
      {metaPixel?.pixelId && (
        <>
          <Script id="fb-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
              document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixel.pixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        </>
      )}
      {metaPixel?.googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${metaPixel.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-event" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${metaPixel.googleAnalyticsId}');
            `}
          </Script>
        </>
      )}
    </>
  );
}
