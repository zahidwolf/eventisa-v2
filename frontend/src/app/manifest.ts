import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Eventisa",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#050508",
    theme_color: "#070B1A",
    orientation: "portrait-primary",
    lang: "en-BD",
    categories: ["entertainment", "events"],
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
