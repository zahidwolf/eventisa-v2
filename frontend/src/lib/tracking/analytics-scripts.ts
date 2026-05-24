import { env } from "@/config/env";

export interface TrackingConfig {
  metaPixelId: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
}

let memoryCache: TrackingConfig | null = null;

export async function fetchTrackingConfig(): Promise<TrackingConfig> {
  if (memoryCache) return memoryCache;

  const res = await fetch(`${env.apiUrl}/public/tracking-config`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return { metaPixelId: "", googleAnalyticsId: "", googleTagManagerId: "" };
  }
  const json = (await res.json()) as { data?: TrackingConfig };
  const config = json.data ?? {
    metaPixelId: "",
    googleAnalyticsId: "",
    googleTagManagerId: "",
  };
  memoryCache = config;
  return config;
}

export function injectGoogleAnalytics(gaId: string): void {
  if (typeof document === "undefined" || !gaId.trim()) return;
  if (document.getElementById("eventisa-ga4")) return;

  const loader = document.createElement("script");
  loader.id = "eventisa-ga4";
  loader.async = true;
  loader.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(loader);

  const inline = document.createElement("script");
  inline.id = "eventisa-ga4-inline";
  inline.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId.replace(/'/g, "\\'")}');
  `;
  document.head.appendChild(inline);
}

export function injectGoogleTagManager(gtmId: string): void {
  if (typeof document === "undefined" || !gtmId.trim()) return;
  if (document.getElementById("eventisa-gtm")) return;

  const script = document.createElement("script");
  script.id = "eventisa-gtm";
  script.async = true;
  script.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId.replace(/'/g, "\\'")}');
  `;
  document.head.appendChild(script);

  if (document.getElementById("eventisa-gtm-noscript")) return;
  const noscript = document.createElement("noscript");
  noscript.id = "eventisa-gtm-noscript";
  noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId.replace(/"/g, "&quot;")}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
  document.body.prepend(noscript);
}
