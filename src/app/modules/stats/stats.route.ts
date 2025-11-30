// src/modules/otp/otp.routes.ts
import express from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { StatsControllers } from "./stats.controller";

const router = express.Router();
// checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
router.get(
  "/dashboard",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  StatsControllers.dashboard,
);

router.get(
  "/last12MonthsStats",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  StatsControllers.last12MonthsStats,
);
router.get(
  "/recentOrders",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  StatsControllers.recentOrders,
);

export const StatsRoutes = router;
