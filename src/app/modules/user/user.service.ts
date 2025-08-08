import AppError from "../../error/AppError";
import { IAuthProvider, IsActive, IUser, Role } from "./user.interface";
import bcryptjs from "bcryptjs";
import httpStatus from "http-status-codes";
import { User } from "./user.model";
import { userSearchableFields } from "./user.constant";
import { QueryBuilder } from "../../utils/queryBuilder";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { verifyToken } from "../../utils/jwt";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";

//*--------------------------------------------------------- create user------------------------------------------------
const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User Already Exist , Please Login",
    );
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  return user;
};

//*---------------------------------------------------------------get all users---------------------------------------
const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);
  const usersData = queryBuilder
    .filter()
    .search(userSearchableFields)
    .sort()
    .fields()
    .paginate();

  const [data, meta] = await Promise.all([
    usersData.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

//*---------------------------------------------------------------get me--------------------------------------------

const getMe = async (accessToken: string) => {
  if (!accessToken) {
    throw new AppError(401, "No Token Received");
  }
  const verifiedToken = verifyToken(
    accessToken,
    envVars.JWT_ACCESS_SECRET,
  ) as JwtPayload;

  const isUserExist = await User.findOne({
    email: verifiedToken.email,
  });
  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Not Exist");
  }

  if (isUserExist.isActive === IsActive.BLOCKED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are Blocked, Please contact helpline",
    );
  }

  const user = await User.findById(verifiedToken.userId).select("-password");
  return {
    data: user,
  };
};

//*---------------------------------------------------------------get single users----------------------------------

const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select("-password");
  return {
    data: user,
  };
};

//*---------------------------------------------------------------update user-----------------------------------------
const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload,
) => {
  //user cannot update others
  if (decodedToken.role === Role.USER) {
    if (userId !== decodedToken.userId) {
      throw new AppError(401, "You are not authorized");
    }
  }

  const ifUserExist = await User.findById(userId);

  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  //admin trying to update super-admin
  if (
    decodedToken.role === Role.ADMIN &&
    ifUserExist.role === Role.SUPER_ADMIN
  ) {
    throw new AppError(401, "You are not authorized");
  }

  //its work when update role i mean payload.role
  if (payload.role) {
    if (decodedToken.role === Role.USER) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
    if (decodedToken.userId === ifUserExist._id.toString()) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You cannot update your own role",
      );
    }
  }

  //its work when user want update there isactive/is deleted status
  if (payload.isVerified) {
    if (decodedToken.role === Role.USER) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }
  if (payload.isActive === "ACTIVE" || payload.isActive === "BLOCKED") {
    if (decodedToken.role === Role.USER) {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
    if (decodedToken.userId === ifUserExist._id.toString()) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You Cannot Update Your Own Status",
      );
    }
  }

  const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdatedUser;
};

//All exports
export const UserServices = {
  createUser,
  getAllUsers,
  getMe,
  getSingleUser,
  updateUser,
};
