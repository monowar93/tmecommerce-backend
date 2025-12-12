import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { OtpRoutes } from "../modules/otp/otp.route";
import { ProductsRoutes } from "../modules/products/products.route";
import { CouponRoutes } from "../modules/coupon/coupon.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { OrderRoutes } from "../modules/order/order.route";
import { SupportRoutes } from "../modules/support/support.route";
import { AiRoutes } from "../modules/Ai/ai.route";
import { StatsRoutes } from "../modules/stats/stats.route";

export const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/otp",
    route: OtpRoutes,
  },
  {
    path: "/product",
    route: ProductsRoutes,
  },
  {
    path: "/coupon",
    route: CouponRoutes,
  },
  {
    path: "/payment",
    route: PaymentRoutes,
  },
  {
    path: "/order",
    route: OrderRoutes,
  },
  {
    path: "/support",
    route: SupportRoutes,
  },
  {
    path: "/ai",
    route: AiRoutes,
  },
  {
    path: "/stats",
    route: StatsRoutes,
  },
];
// ---------------> All module routes registered here <--------------- //
moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
