import { PaymentGateway } from "@/modules/payments/models/paymentGateway.model.js";

export async function listPaymentGatewaysSlim() {
  const rows = await PaymentGateway.find()
    .select("name provider displayName logo isActive isDefault createdAt")
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();

  return rows.map((g) => ({
    _id: g._id.toString(),
    name: g.name,
    provider: g.provider,
    displayName: g.displayName,
    logo: g.logo,
    isActive: g.isActive,
    isDefault: g.isDefault,
    createdAt: g.createdAt,
  }));
}

export async function getPaymentGatewayById(gatewayId: string) {
  const gw = await PaymentGateway.findById(gatewayId).lean();
  if (!gw) return null;
  return {
    _id: gw._id.toString(),
    name: gw.name,
    provider: gw.provider,
    displayName: gw.displayName,
    logo: gw.logo,
    isActive: gw.isActive,
    isDefault: gw.isDefault,
    credentials: gw.credentials,
    createdAt: gw.createdAt,
    updatedAt: gw.updatedAt,
  };
}
