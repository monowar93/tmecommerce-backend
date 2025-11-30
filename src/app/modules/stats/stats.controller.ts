import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatsServices } from "./stats.service";

//*---------------------------------------------------------------Get dashboard 4 statistics-----------------------------------------
const dashboard = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await StatsServices.dashboard();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Dashboard stats retrieved successfully",
      data: result,
    });
  },
);

//*---------------------------------------------------------------Get last 12 months statistics-----------------------------------------
const last12MonthsStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await StatsServices.last12MonthsStats();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Last 12 months stats retrieved successfully",
      data: result,
    });
  },
);

//*---------------------------------------------------------------Get recent orders-----------------------------------------
const recentOrders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await StatsServices.recentOrders();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Recent orders retrieved successfully",
      data: result,
    });
  },
);

export const StatsControllers = {
  dashboard,
  last12MonthsStats,
  recentOrders,
};
