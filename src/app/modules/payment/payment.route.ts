// src/modules/otp/otp.routes.ts
import express from "express";
import { PaymentController } from "./payment.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";

const router = express.Router();

router.post(
  "/intent",
  checkAuth(...Object.values(Role)),
  PaymentController.createPaymentIntent,
);

export const PaymentRoutes = router;
