import { apiClient } from "@/services/api/client";
import type { ApiResponse } from "@/types/api/response";

export interface OrganizerSettingsProfile {
  name: string;
  phone: string;
  bio: string;
  website?: string;
  email?: string;
  socialLinks: Record<string, string | undefined>;
}

export interface OrganizerSettingsOrganization {
  orgName: string;
  orgType?: string;
  description: string;
  logo?: string;
  coverPhoto?: string;
  address: string;
  city: string;
  establishedYear?: number;
  licenseNumber: string;
  /** Present for edit forms / legacy */
  businessName?: string;
  slug?: string;
}

export interface OrganizerSettingsBanking {
  preferredMethod?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  branchName?: string;
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
  bankingVerified?: boolean;
}

export interface OrganizerSettings {
  profile: OrganizerSettingsProfile;
  organization: OrganizerSettingsOrganization;
  notifications: Record<string, boolean>;
  banking: OrganizerSettingsBanking;
}

export function isOrganizerBankingConfigured(banking: OrganizerSettingsBanking): boolean {
  const method = banking.preferredMethod;
  if (!method) return false;
  if (method === "bank_transfer") {
    return Boolean(banking.bankName && banking.accountNumber && banking.accountName);
  }
  if (method === "bkash") return Boolean(banking.bkashNumber);
  if (method === "nagad") return Boolean(banking.nagadNumber);
  if (method === "rocket") return Boolean(banking.rocketNumber);
  return false;
}

export async function fetchOrganizerSettings() {
  const res = await apiClient.get<ApiResponse<OrganizerSettings>>("/organizer/settings");
  return res.data.data!;
}

export async function patchOrganizerProfile(body: Record<string, unknown>) {
  const res = await apiClient.patch<ApiResponse<OrganizerSettings>>("/organizer/profile", body);
  return res.data.data!;
}

export async function patchOrganizerOrganization(body: Record<string, unknown>) {
  const res = await apiClient.patch<ApiResponse<OrganizerSettings>>("/organizer/organization", body);
  return res.data.data!;
}

export async function patchNotificationPreferences(body: Record<string, boolean>) {
  const res = await apiClient.patch<ApiResponse<OrganizerSettings>>(
    "/organizer/notification-preferences",
    body
  );
  return res.data.data!;
}

export async function patchOrganizerBanking(body: Record<string, unknown>) {
  const res = await apiClient.patch<ApiResponse<OrganizerSettings>>("/organizer/banking", body);
  return res.data.data!;
}

export async function changeOrganizerPassword(body: {
  currentPassword: string;
  newPassword: string;
}) {
  await apiClient.post("/organizer/change-password", body);
}

export async function deleteOrganizerAccount() {
  await apiClient.post("/organizer/delete-account", { confirmation: "DELETE" });
}
