import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "edge";
export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #050508 0%, #7C3AED 50%, #EC4899 100%)",
          color: "white",
          fontSize: 64,
          fontWeight: 700,
        }}
      >
        {siteConfig.name}
      </div>
    ),
    { ...size }
  );
}
