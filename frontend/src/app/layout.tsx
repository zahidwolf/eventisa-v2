import type { Metadata } from "next";
import { Inter, Hind_Siliguri } from "next/font/google";
import "@/styles/globals.css";
import { AppProviders } from "@/providers/app-providers";
import { RootChrome } from "@/components/layout/root-chrome";
import { AdminAuthInitializer } from "@/components/admin/admin-auth-initializer";
import { TrackingProvider } from "@/components/tracking/TrackingProvider";
import { createPageMetadata } from "@/lib/seo/metadata";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

export const metadata: Metadata = createPageMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${hindSiliguri.variable} font-sans antialiased`}
        style={{ ["--font-display" as string]: '"Clash Display", system-ui, sans-serif' }}
      >
        <AppProviders>
          <AdminAuthInitializer />
          <TrackingProvider />
          <RootChrome>{children}</RootChrome>
        </AppProviders>
      </body>
    </html>
  );
}
