import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { CouponServices } from "./coupon.service";

//*---------------------------------------------Create Coupon----------------------------
const createCoupon = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await CouponServices.createCoupon(payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `coupon : ${result.code}, successfully created`,
      data: result,
    });
  },
);

//*---------------------------------------------getAllCoupon----------------------------

const getAllCoupon = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await CouponServices.getAllCoupon();
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All Coupon retrieved successful",
      data: result,
    });
  },
);

//*---------------------------------------------applyDiscount----------------------------

const applyDiscount = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.query;

    const result = await CouponServices.applyDiscount(code as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Coupon applied successfully",
      data: result,
    });
  },
);

//*---------------------------------------------updateCoupon----------------------------

const updateCoupon = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const payload = req.body;

    const result = await CouponServices.updateCouponStatus(id, payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Coupon Updated successfully",
      data: result,
    });
  },
);

//*---------------------------------------------deleteCoupon----------------------------

const deleteCoupon = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const deletedCoupon = await CouponServices.deleteCoupon(id);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `Coupon "${deletedCoupon.code}" deleted successfully`,
      data: null,
    });
  },
);

export const CouponController = {
  createCoupon,
  getAllCoupon,
  applyDiscount,
  updateCoupon,
  deleteCoupon,
};
