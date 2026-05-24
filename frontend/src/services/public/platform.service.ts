import axios from "axios";
import { getApiBaseUrl } from "@/lib/api-base-url";

export async function fetchPlatformStatus() {
  const res = await axios.get<{
    success: boolean;
    data: {
      maintenanceMode: boolean;
      platformName: string;
      serviceFeePercent: number;
      supportEmail: string;
    };
  }>(`${getApiBaseUrl()}/public/platform-status`, { timeout: 5000 });
  return res.data.data;
}
