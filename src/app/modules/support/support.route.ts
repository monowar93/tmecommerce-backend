// src/modules/otp/otp.routes.ts
import express from "express";
import { SupportController } from "./support.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { emailSchema } from "./support.validations";

const router = express.Router();

router.post(
  "/newsletter",
  validateRequest(emailSchema),
  SupportController.newsletter,
);

export const SupportRoutes = router;
