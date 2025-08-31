import httpStatus from "http-status-codes";
import AppError from "../../error/AppError";
import { ICoupon } from "./coupon.validation";
import { Coupon } from "./coupon.model";

//*---------------------------------------------create Coupon----------------------------

const createCoupon = async (payload: ICoupon) => {
  const { code, amount } = payload;
  if (!code || !amount) {
    throw new AppError(httpStatus.BAD_REQUEST, "Please provide all fields");
  }

  const existingCoupon = await Coupon.findOne({ code });
  if (existingCoupon) {
    throw new AppError(httpStatus.CONFLICT, "Coupon code already exists");
  }

  const newCoupon = await Coupon.create({ code, amount });
  return newCoupon;
};

//*---------------------------------------------getAllCoupon----------------------------
const getAllCoupon = async () => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return coupons;
};

//*---------------------------------------------applyDiscount----------------------------
const applyDiscount = async (code: string) => {
  const coupon = await Coupon.findOne({ code });
  if (!coupon) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Please enter a valid coupon code",
    );
  }
  if (!coupon.isActive) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This coupon is blocked or inactive",
    );
  }

  return coupon;
};

//*---------------------------------------------updateCoupon----------------------------
const updateCouponStatus = async (
  id: string,
  payload: { isActive: boolean },
) => {
  const coupon = await Coupon.findById(id);

  if (!coupon) {
    throw new AppError(httpStatus.NOT_FOUND, "Coupon not found");
  }

  coupon.isActive = payload.isActive;
  await coupon.save();

  return coupon;
};

//*---------------------------------------------deleteCoupon----------------------------
const deleteCoupon = async (id: string) => {
  const deletedCoupon = await Coupon.findByIdAndDelete(id);

  if (!deletedCoupon) {
    throw new AppError(httpStatus.NOT_FOUND, "Coupon not found");
  }

  return deletedCoupon;
};

export const CouponServices = {
  createCoupon,
  getAllCoupon,
  applyDiscount,
  updateCouponStatus,
  deleteCoupon,
};
