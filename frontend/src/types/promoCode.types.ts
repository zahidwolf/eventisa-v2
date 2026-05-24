export type PromoCodeType = "percentage" | "flat";

export type PromoCodeStatus = "active" | "expired" | "exhausted" | "inactive";

export interface PromoCode {
  _id: string;
  code: string;
  eventId: string;
  segmentIds: string[];
  type: PromoCodeType;
  value: number;
  maxUses: number;
  usedCount: number;
  perUserLimit: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  status?: PromoCodeStatus;
  createdAt?: string;
}

export interface PromoCodeFormData {
  code?: string;
  type: PromoCodeType;
  value: number;
  maxUses: number;
  perUserLimit: number;
  validFrom: string;
  validUntil: string;
  segmentIds: string[];
  isActive?: boolean;
}

export interface ValidateCodeResponse {
  valid: boolean;
  type?: PromoCodeType;
  value?: number;
  discountAmount: number;
  finalPrice: number;
  message?: string;
  code?: string;
}

export interface PromoCodeStats {
  totalUses: number;
  totalDiscountGiven: number;
  conversionRate: number;
  code?: PromoCode;
  status?: PromoCodeStatus;
}

export interface SegmentOption {
  segmentId: string;
  name: string;
}
