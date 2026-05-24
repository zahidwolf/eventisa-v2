import type { Request, Response } from "express";
import { asyncHandler } from "@/shared/utils/async-handler.js";
import { AppError } from "@/shared/errors/AppError.js";
import { ErrorCodes } from "@/shared/errors/errorCodes.js";
import {
  createOrganizerProfile,
  getOrganizerBySlug,
  getOrganizerShowcase,
  approveOrganizer,
  rejectOrganizer,
  registerOrganizerAccount,
} from "@/modules/organizers/services/organizer.service.js";
import { Organizer } from "@/modules/organizers/models/organizer.model.js";
import {
  onOrganizerApproved,
  onOrganizerRejected,
} from "@/shared/email/emailTriggers.service.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await registerOrganizerAccount(req.body);

  res.status(201).json({
    success: true,
    data: {
      email: result.email,
      requiresVerification: result.requiresVerification,
      organizer: {
        verificationStatus: result.organizer.verificationStatus,
      },
    },
    message:
      "Account created! Please check your email to verify your account. Your organizer application is pending admin review.",
  });
});

export const apply = asyncHandler(async (req: Request, res: Response) => {
  const organizer = await createOrganizerProfile(req.user!.id, req.body);

  res.status(201).json({
    success: true,
    data: { organizer },
    message: "Organizer application submitted. Awaiting admin approval.",
  });
});

export const getShowcase = asyncHandler(async (_req: Request, res: Response) => {
  const organizers = await getOrganizerShowcase();
  res.json({ success: true, data: { organizers } });
});

export const getBySlug = asyncHandler(async (req: Request, res: Response) => {
  const result = await getOrganizerBySlug(req.params.slug as string);

  if (!result) {
    throw new AppError("Organizer not found", 404, ErrorCodes.NOT_FOUND);
  }

  res.json({ success: true, data: result });
});

export const listPending = asyncHandler(async (_req: Request, res: Response) => {
  const pending = await Organizer.find({ verificationStatus: "pending" }).populate(
    "userId",
    "name email"
  );

  res.json({ success: true, data: { organizers: pending } });
});

export const approve = asyncHandler(async (req: Request, res: Response) => {
  const organizer = await approveOrganizer(req.params.id as string);
  if (!organizer) {
    throw new AppError("Organizer not found", 404, ErrorCodes.NOT_FOUND);
  }
  onOrganizerApproved(organizer._id.toString()).catch((err) =>
    console.error("Email trigger failed:", err)
  );
  res.json({ success: true, data: { organizer }, message: "Organizer approved" });
});

export const reject = asyncHandler(async (req: Request, res: Response) => {
  const organizer = await rejectOrganizer(req.params.id as string);
  if (!organizer) {
    throw new AppError("Organizer not found", 404, ErrorCodes.NOT_FOUND);
  }
  const reason = (req.body?.reason as string | undefined) ?? "";
  onOrganizerRejected(organizer._id.toString(), reason).catch((err) =>
    console.error("Email trigger failed:", err)
  );
  res.json({ success: true, data: { organizer }, message: "Organizer rejected" });
});

export const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
  const organizer = await Organizer.findOne({ userId: req.user!.id });
  if (!organizer) {
    throw new AppError("Organizer profile not found", 404, ErrorCodes.NOT_FOUND);
  }
  res.json({ success: true, data: { organizer } });
});
