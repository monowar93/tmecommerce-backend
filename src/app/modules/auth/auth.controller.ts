import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import passport from "passport";
import AppError from "../../error/AppError";
import { createUserTokens } from "../../utils/userTokens";
import { setAuthCookies } from "../../utils/setCookies";
import { AuthServices } from "./auth.service";

const isProduction = envVars.NODE_ENV === "production";

//*---------------------------------------------Login Users---------------------------->
const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
        return next(new AppError(401, err));
      }

      if (!user) {
        return next(new AppError(401, info.message));
      }

      const userTokens = await createUserTokens(user);
      setAuthCookies(res, userTokens);

      const userWithoutPassword = user.toObject();
      delete userWithoutPassword.password;

      sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Log In Successfully",
        data: userWithoutPassword,
      });
    })(req, res, next);
  },
);

//*---------------------------------------------Refresh-Token---------------------------->

const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "No refresh token receive from cookies",
      );
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken);

    setAuthCookies(res, tokenInfo);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "New Access Token Get Successfully",
      data: tokenInfo,
    });
  },
);

//*---------------------------------------------google Callback ----------------------------
const googleCallback = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let redirectTo = req.query.state ? (req.query.state as string) : "";

    if (redirectTo.startsWith("/")) {
      redirectTo = redirectTo.slice(1);
    }

    const user = req.user;

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    const tokenInfo = createUserTokens(user);

    setAuthCookies(res, tokenInfo);
    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}?loginSuccess=true`);
  },
);

//*---------------------------------------------Logout Users----------------------------
const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: isProduction ? "none" : "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: isProduction ? "none" : "lax",
    });

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Logged Out",
      data: null,
    });
  },
);

//*---------------------------------------------change Password----------------------------
const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const changedPassword = await AuthServices.changePassword(
      oldPassword,
      newPassword,
      decodedToken as JwtPayload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Password reset successfully",
      data: changedPassword.message,
    });
  },
);

//*---------------------------------------------forgot Password----------------------------
const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email) {
      throw new AppError(404, "Please Provide a Valid email");
    }
    await AuthServices.forgotPassword(email);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Password reset successfully",
      data: null,
    });
  },
);

//*---------------------------------------------reset Password----------------------------
const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization;
    if (!accessToken) {
      throw new AppError(401, "No Token Received");
    }
    await AuthServices.resetPassword(req.body, accessToken);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Password change successfully",
      data: null,
    });
  },
);

export const AuthController = {
  credentialsLogin,
  getNewAccessToken,
  googleCallback,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
};
