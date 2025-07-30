import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";

//*---------------------------------------------Refresh Token----------------------------

import AppError from "../../error/AppError";
import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokens";
import { User } from "../user/user.model";
import { IAuthProvider, IsActive } from "../user/user.interface";
import { envVars } from "../../config/env";
import { sendEmail } from "../../utils/sendEmail";
import { verifyToken } from "../../utils/jwt";

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await createNewAccessTokenWithRefreshToken(
    refreshToken,
  );
  return {
    accessToken: newAccessToken,
  };
};

//*---------------------------------------------Set Password ----------------------------

const setPassword = async (userId: string, plainPassword: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (
    user.password &&
    user.auths.some((providerObject) => providerObject.provider === "google")
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already set password,please change your password",
    );
  }

  const hashedPassword = await bcryptjs.hash(
    plainPassword,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  const credentialProvider: IAuthProvider = {
    provider: "credentials",
    providerId: user.email,
  };
  const auth: IAuthProvider[] = [...user.auths, credentialProvider];

  user.password = hashedPassword;
  user.auths = auth;

  await user.save();

  return {
    message: "Password updated successfully",
  };
};

//*---------------------------------------------change Password ----------------------------

const changePassword = async (
  oldPassword: string,
  newPassword: string,
  decodedToken: JwtPayload,
) => {
  // 1. Find user by ID from token
  const user = await User.findById(decodedToken.userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // 2. Compare old password
  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword,
    user?.password as string,
  );

  if (!isOldPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old password does not match");
  }

  // 3. Hash the new password
  const newHashedPassword = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  // 4. Save new password
  user.password = newHashedPassword;
  await user.save();

  return {
    message: "Password updated successfully",
  };
};

//*---------------------------------------------forget Password ----------------------------

const forgotPassword = async (email: string) => {
  const isUserExist = await User.findOne({ email });
  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Not Exist");
  }

  // if (!isUserExist.isVerified) {
  //   throw new AppError(httpStatus.BAD_REQUEST, "User is not Verified");
  // }

  if (isUserExist.isActive === IsActive.BLOCKED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are Blocked, Please contact helpline",
    );
  }

  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const resetToken = jwt.sign(jwtPayload, envVars.JWT_FORGOT_PASSWORD_SECRET, {
    expiresIn: "10m",
  });

  const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`;

  sendEmail({
    to: isUserExist.email,
    subject: "Password Reset",
    templateName: "forgetPassword",
    templateData: {
      name: isUserExist.name,
      resetUILink,
    },
  });
};

//*---------------------------------------------reset Password ----------------------------
const resetPassword = async (
  payload: Record<string, any>,
  accessToken: string,
) => {
  try {
    const verifiedToken = verifyToken(
      accessToken,
      envVars.JWT_FORGOT_PASSWORD_SECRET,
    ) as JwtPayload;

    const isUserExist = await User.findOne({
      email: verifiedToken.email,
    });
    if (!isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User Not Exist");
    }
    if (isUserExist.isActive === IsActive.BLOCKED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You are Blocked, Please contact helpline",
      );
    }

    if (payload.id != isUserExist._id) {
      throw new AppError(401, "You cannot reset your password");
    }
    const password = payload.newPassword;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    if (!password || !passwordRegex.test(password)) {
      throw new AppError(
        400,
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      );
    }

    const hashedPassword = await bcryptjs.hash(
      password,
      Number(envVars.BCRYPT_SALT_ROUND),
    );

    isUserExist.password = hashedPassword;

    await isUserExist.save();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new AppError(401, "Reset link expired. Please request a new one.");
    }
    throw error;
  }
};

//All exports
export const AuthServices = {
  getNewAccessToken,
  setPassword,
  changePassword,
  forgotPassword,
  resetPassword,
};
