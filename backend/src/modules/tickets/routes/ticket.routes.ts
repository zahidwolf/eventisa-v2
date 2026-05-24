import { Router } from "express";
import { optionalAuthenticate } from "@/shared/middleware/auth/authenticate.middleware.js";
import * as ticketController from "@/modules/tickets/controllers/ticket.controller.js";

const router = Router();

router.post("/generate", ticketController.generate);
router.get("/order", ticketController.listByOrder);
router.get("/:id", optionalAuthenticate, ticketController.getById);

export default router;
