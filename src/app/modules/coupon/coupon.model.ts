import mongoose from "mongoose";
import { ICoupon } from "./coupon.validation";

const CouponSchema = new mongoose.Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, "Please enter Coupon  code"],
      unique: true,
    },
    amount: {
      type: Number,
      required: [true, "Please enter Discount Amount"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Coupon = mongoose.model<ICoupon>("Coupon", CouponSchema);
