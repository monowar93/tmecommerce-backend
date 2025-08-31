import { NextFunction, Request, Response, Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { CouponController } from "./coupon.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createCouponZodSchema,
  UpdateCouponZodSchema,
} from "./coupon.validation";

const router = Router();

export const CouponRoutes = router;
// Create new coupon - /api/v1/coupon/create
router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createCouponZodSchema),
  CouponController.createCoupon,
);

// Get All Coupon - /api/v1/coupon/all
router.get(
  "/all",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CouponController.getAllCoupon,
);

// applyDiscount - /api/v1/coupon/applyDiscount
router.get(
  "/apply-discount",
  checkAuth(...Object.values(Role)),
  CouponController.applyDiscount,
);

// update coupon - /api/v1/coupon/:id
router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(UpdateCouponZodSchema),
  CouponController.updateCoupon,
);

// delete - /api/v1/coupon/:id
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  CouponController.deleteCoupon,
);
