import { adminApiClient } from "@/services/api/admin-client";
import type { ApiResponse } from "@/types/api/response";

import type { HeroBanner, HeroBannerInput } from "@/types/models/hero-banner";

export type { HeroBanner, HeroBannerInput };

export async function fetchHeroBanners() {
  const res = await adminApiClient.get<ApiResponse<{ banners: HeroBanner[] }>>("/admin/hero-banners");
  return res.data.data!.banners;
}

export async function createHeroBanner(input: HeroBannerInput) {
  const res = await adminApiClient.post<ApiResponse<{ banner: HeroBanner }>>(
    "/admin/hero-banners",
    input
  );
  return res.data.data!.banner;
}

export async function updateHeroBanner(id: string, input: Partial<HeroBannerInput>) {
  const res = await adminApiClient.patch<ApiResponse<{ banner: HeroBanner }>>(
    `/admin/hero-banners/${id}`,
    input
  );
  return res.data.data!.banner;
}

export async function deleteHeroBanner(id: string) {
  await adminApiClient.delete(`/admin/hero-banners/${id}`);
}
