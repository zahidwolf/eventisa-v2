export enum PaymentGatewayProvider {
  Sslcommerz = "sslcommerz",
  Bkash = "bkash",
  Nagad = "nagad",
}

export interface SslcommerzCredentials {
  storeId: string;
  storePass: string;
  sandbox: boolean;
}

export interface BkashCredentials {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  sandbox: boolean;
}

export interface NagadCredentials {
  merchantId: string;
  merchantNumber: string;
  pubKey: string;
  privKey: string;
  sandbox: boolean;
}

export type GatewayCredentials =
  | SslcommerzCredentials
  | BkashCredentials
  | NagadCredentials;

export interface GatewayPublicInfo {
  displayName: string;
  logo?: string;
  provider: PaymentGatewayProvider;
  isDefault: boolean;
}
