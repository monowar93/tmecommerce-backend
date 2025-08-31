import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { OrderServices } from "./order.services";
import { JwtPayload } from "jsonwebtoken";

//*---------------------------------------------New Order----------------------------
const newOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const verifiedToken = req.user;

    const result = await OrderServices.newOrder(
      payload,
      verifiedToken as JwtPayload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Order create Successful",
      data: result,
    });
  },
);

//*---------------------------------------------My Orders----------------------------
const myOrders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const verifiedToken = req.user;

    const result = await OrderServices.myOrders(verifiedToken as JwtPayload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Order Retrieved Successful",
      data: result,
    });
  },
);

//*---------------------------------------------All Orders----------------------------
const allOrders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await OrderServices.allOrders();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "All Order Retrieved Successful",
      data: result,
    });
  },
);

//*---------------------------------------------get single Order----------------------------
const getSingleOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await OrderServices.getSingleOrder(id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "All Order Retrieved Successful",
      data: result,
    });
  },
);

//*---------------------------------------------update Order status----------------------------
const processOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodeToken = req.user as JwtPayload;
    const orderId = req.params.id;
    const updateData = req.body;

    const result = await OrderServices.processOrder(
      decodeToken.userId,
      orderId,
      updateData,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "All Order Retrieved Successful",
      data: result,
    });
  },
);

export const OrderControllers = {
  newOrder,
  myOrders,
  allOrders,
  getSingleOrder,
  processOrder,
};
