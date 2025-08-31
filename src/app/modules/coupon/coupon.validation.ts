import { z } from "zod";

export const createCouponZodSchema = z.object({
  code: z
    .string()
    .min(3, { message: "Coupon code must be at least 3 characters long" })
    .max(15, { message: "Coupon code cannot exceed 15 characters" }),

  amount: z.coerce
    .number()
    .positive({ message: "Discount amount must be greater than 0" }),
  isActive: z.boolean().optional().default(true),
});

export const UpdateCouponZodSchema = z.object({
  isActive: z.boolean(),
});

export interface ICoupon {
  code: string;
  amount: number;
  isActive?: boolean;
}
