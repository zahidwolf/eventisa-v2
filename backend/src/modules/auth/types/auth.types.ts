import type { SafeUser } from "@/modules/users/types/user.types.js";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: SafeUser;
  message?: string;
}

export interface TokenPairResult {
  tokens: AuthTokens;
  user: SafeUser;
}
