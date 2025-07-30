import { NextFunction, Request, Response, Router } from "express";
import passport from "passport";
import { AuthController } from "./auth.controller";
import { envVars } from "../../config/env";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

//Route api/v1/auth/login
router.post("/login", AuthController.credentialsLogin);

//Route api/v1/auth/refresh-token
router.post("/refresh-token", AuthController.getNewAccessToken);

//Route api/v1/auth/google
router.get("/google", (req: Request, res: Response, next: NextFunction) => {
  const redirect = req.query.redirect || "/";
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirect as string,
  })(req, res, next);
});
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${envVars.FRONTEND_URL}/sign-in?error=There is some issues with your account. Please contact with out support team!`,
  }),
  AuthController.googleCallback,
);

//Route api/v1/auth/logout
router.post("/logout", AuthController.logout);

//Route api/v1/auth/set-password
router.post(
  "/set-password",
  checkAuth(...Object.values(Role)),
  AuthController.setPassword,
);

//Route api/v1/auth/change-password
router.post(
  "/change-password",
  checkAuth(...Object.values(Role)),
  AuthController.changePassword,
);

//Route api/v1/auth/forgot-password
router.post("/forgot-password", AuthController.forgotPassword);
//Route api/v1/auth/reset-password
router.post("/reset-password", AuthController.resetPassword);

export const AuthRoutes = router;
