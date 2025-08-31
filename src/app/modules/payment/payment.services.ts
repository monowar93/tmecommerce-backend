import { envVars } from "../../config/env";
import AppError from "../../error/AppError";
import { Coupon } from "../coupon/coupon.model";
import { Product } from "../products/products.model";
import { IIntent } from "./payment.interface";
import Stripe from "stripe";

const stripe = new Stripe(envVars.STRIPE_SECRET_KEY);

//*----------------------------------------------------createPaymentIntent-------------------------------------------

const createPaymentIntent = async (payload: IIntent) => {
  const { cartItems, shippingInfo, coupon } = payload;

  if (!cartItems) {
    throw new AppError(400, "Please send cartItems");
  }
  if (!shippingInfo) {
    throw new AppError(400, "Please send shipping info");
  }

  let discountAmount = 0;
  if (coupon) {
    const discount = await Coupon.findOne({ code: coupon });
    if (!discount) {
      throw new AppError(400, "Invalid Coupon Code");
    }
    discountAmount = discount.amount;
  }

  const productIDs = cartItems.map((item) => item.productId);
  const products = await Product.find({
    _id: { $in: productIDs },
  });

  const subtotal = products.reduce((prev, curr) => {
    const item = cartItems.find((i) => i.productId === curr._id.toString());
    if (!item) return prev;
    return curr.price * item.quantity + prev;
  }, 0);

  const shipping = subtotal > 500 ? 0 : 20;

  const total = Math.floor(subtotal + shipping - discountAmount);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: total * 100,
    currency: "usd",
    payment_method_types: ["card"],
    description: "TM-ECommerce",
    shipping: {
      name: shippingInfo.name,
      phone: shippingInfo.phone,
      address: {
        line1: shippingInfo.address,
        postal_code: shippingInfo.pinCode.toString(),
        city: shippingInfo.city,
      },
    },
  });

  return paymentIntent.client_secret;
};

export const PaymentService = {
  createPaymentIntent,
};
