import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import {
  generateTicketsForOrder,
  getTicketById,
  listTicketsByOrder,
} from "@/modules/tickets/services/ticket.service.js";

export const generate = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const tickets = await generateTicketsForOrder(orderId);

  res.status(201).json({
    success: true,
    data: { tickets },
    message: "Tickets generated",
  });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const ticket = await getTicketById(req.params.id as string, req.user?.id);
  res.json({ success: true, data: { ticket } });
});

export const listByOrder = asyncHandler(async (req: Request, res: Response) => {
  const tickets = await listTicketsByOrder(req.query.orderId as string);
  res.json({ success: true, data: { tickets } });
});
