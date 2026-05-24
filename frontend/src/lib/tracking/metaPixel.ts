declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

let initializedPixelId: string | null = null;

function injectMetaPixelScript(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById("eventisa-meta-pixel")) return;

  const script = document.createElement("script");
  script.id = "eventisa-meta-pixel";
  script.async = true;
  script.innerHTML = `
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
  `;
  document.head.appendChild(script);
}

export function initPixel(pixelId: string): void {
  if (typeof window === "undefined" || !pixelId.trim()) return;
  if (initializedPixelId === pixelId && typeof window.fbq === "function") return;

  try {
    injectMetaPixelScript();
    if (typeof window.fbq === "function") {
      window.fbq("init", pixelId);
      window.fbq("track", "PageView");
      initializedPixelId = pixelId;
    }
  } catch {
    /* never block UI */
  }
}

export function pageView(): void {
  trackEvent("PageView");
}

export function trackEvent(eventName: string, data?: Record<string, unknown>): void {
  try {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      if (data) {
        window.fbq("track", eventName, data);
      } else {
        window.fbq("track", eventName);
      }
    }
  } catch {
    /* never block UI */
  }
}
