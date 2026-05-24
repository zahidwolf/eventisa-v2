import { z } from "zod";
import { PaymentGatewayProvider } from "@/modules/payments/types/gateway.types.js";

const credentialsSchema = z.record(z.union([z.string(), z.boolean(), z.number()]));

export const createGatewaySchema = z.object({
  name: z.string().min(2).max(120),
  displayName: z.string().min(2).max(120),
  provider: z.nativeEnum(PaymentGatewayProvider),
  logo: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  credentials: credentialsSchema,
});

export const updateGatewaySchema = createGatewaySchema.partial();

export const assignGatewaySchema = z.object({
  gatewayId: z.string().min(1),
});
