import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { catchAsync } from "../../utils/catchAsync";
import { UserServices } from "./user.service";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../error/AppError";
import { verifyToken } from "../../utils/jwt";
import { User } from "./user.model";
import { IsActive } from "./user.interface";

//*---------------------------------------------Create User----------------------------
const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Created Successfully",
      data: user,
    });
  },
);

//*-------------------------------------------- Get All Users------------------------------
const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await UserServices.getAllUsers(
      query as Record<string, string>,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All users fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  },
);

//*-------------------------------------------- Get me-----------------------------------

const getMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies.accessToken;

    const result = await UserServices.getMe(accessToken);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Your data  Retrieved Successfully",
      data: result.data,
    });
  },
);

//*-------------------------------------------- Get single Users-----------------------------------

const getSingleUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserServices.getSingleUser(id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Retrieved Successfully",
      data: result.data,
    });
  },
);

//*---------------------------------------------Update Users----------------------------
const updateUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const verifiedToken = req.user;
    const payload = req.body;

    const user = await UserServices.updateUser(
      userId,
      payload,
      verifiedToken as JwtPayload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Updated Successfully",
      data: user,
    });
  },
);

export const UserControllers = {
  createUser,
  getAllUsers,
  getMe,
  getSingleUser,
  updateUser,
};
