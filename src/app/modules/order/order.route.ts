import express from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { OrderControllers } from "./order.controller";

const router = express.Router();

// create new order - /api/v1/order/new
router.post(
  "/new",
  checkAuth(...Object.values(Role)),
  OrderControllers.newOrder,
);

// get my order - /api/v1/order/my
router.get("/my", checkAuth(...Object.values(Role)), OrderControllers.myOrders);

// get all orders - /api/v1/order/all
router.get(
  "/all",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  OrderControllers.allOrders,
);

// get order details - /api/v1/order/:id
router.get(
  "/:id",
  checkAuth(...Object.values(Role)),
  OrderControllers.getSingleOrder,
);

// update order - /api/v1/order/:id
router.patch(
  "/:id",
  checkAuth(...Object.values(Role)),
  OrderControllers.processOrder,
);

export const OrderRoutes = router;
