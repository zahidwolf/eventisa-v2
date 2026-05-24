import { adminApiClient } from "@/services/api/admin-client";
import type { ApiResponse } from "@/types/api/response";

export interface City {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  isActive: boolean;
  order: number;
}

export type CityInput = {
  name: string;
  slug?: string;
  image?: string;
  isActive?: boolean;
  order?: number;
};

export async function fetchAdminCities() {
  const res = await adminApiClient.get<ApiResponse<{ cities: City[] }>>("/admin/cities");
  return res.data.data!.cities;
}

export async function createCity(input: CityInput) {
  const res = await adminApiClient.post<ApiResponse<{ city: City }>>("/admin/cities", input);
  return res.data.data!.city;
}

export async function updateCity(id: string, input: Partial<CityInput>) {
  const res = await adminApiClient.patch<ApiResponse<{ city: City }>>(`/admin/cities/${id}`, input);
  return res.data.data!.city;
}

export async function deleteCity(id: string) {
  await adminApiClient.delete(`/admin/cities/${id}`);
}
