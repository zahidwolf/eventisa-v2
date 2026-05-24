import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import * as gatewayManager from "@/modules/payments/services/gatewayManager.service.js";
import {
  listPaymentGatewaysSlim,
  getPaymentGatewayById,
} from "@/modules/payments/services/gateway-admin-read.service.js";

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const gateways = await listPaymentGatewaysSlim();
  res.json({ success: true, data: { gateways } });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const gateway = await getPaymentGatewayById(req.params.id as string);
  if (!gateway) {
    res.status(404).json({ success: false, message: "Gateway not found" });
    return;
  }
  res.json({ success: true, data: { gateway } });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const gateway = await gatewayManager.createGateway(req.admin!.id, req.body);
  res.status(201).json({ success: true, data: { gateway }, message: "Gateway created" });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const gateway = await gatewayManager.updateGateway(
    req.params.id as string,
    req.admin!.id,
    req.body
  );
  res.json({ success: true, data: { gateway }, message: "Gateway updated" });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await gatewayManager.deleteGateway(req.params.id as string, req.admin!.id);
  res.json({ success: true, message: "Gateway deleted" });
});

export const setDefault = asyncHandler(async (req: Request, res: Response) => {
  const gateway = await gatewayManager.setDefaultGateway(req.params.id as string, req.admin!.id);
  res.json({ success: true, data: { gateway }, message: "Default gateway updated" });
});

export const assignToEvent = asyncHandler(async (req: Request, res: Response) => {
  const result = await gatewayManager.assignGatewayToEvent(
    req.params.eventId as string,
    req.body.gatewayId,
    req.admin!.id
  );
  res.json({ success: true, data: result, message: "Gateway assigned to event" });
});

export const removeFromEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await gatewayManager.removeGatewayFromEvent(
    req.params.eventId as string,
    req.admin!.id
  );
  res.json({ success: true, data: { event }, message: "Event uses platform default gateway" });
});

export const eventAssignment = asyncHandler(async (req: Request, res: Response) => {
  const assignment = await gatewayManager.getEventGatewayAssignment(req.params.eventId as string);
  res.json({ success: true, data: assignment });
});

export const publicGatewayInfo = asyncHandler(async (req: Request, res: Response) => {
  const info = await gatewayManager.getEventGatewayPublicInfo(req.params.eventId as string);
  res.json({ success: true, data: info });
});
