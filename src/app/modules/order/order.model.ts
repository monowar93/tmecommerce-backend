import mongoose from "mongoose";
import { IOrder, OrderStatus } from "./order.interface";

const orderSchema = new mongoose.Schema<IOrder>(
  {
    shippingInfo: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },

      pinCode: {
        type: Number,
        required: true,
      },
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
    },
    shippingCharges: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PROCESSING,
    },
    orderItems: [
      {
        name: String,
        photo: String,
        price: Number,
        quantity: Number,
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
  },

  {
    timestamps: true,
  },
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);
