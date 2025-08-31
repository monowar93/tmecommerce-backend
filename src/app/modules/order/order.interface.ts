import { Types } from "mongoose";
export enum OrderStatus {
  PROCESSING = "Processing",
  SHIPPED = "Shipped",
  DELIVERED = "Delivered",
  CANCELLED = "Cancelled",
}
export interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  pinCode: number;
}

export type OrderItem = {
  productId: string;
  photo: string;
  name: string;
  price: number;
  quantity: number;
};

export interface OrderPayload {
  shippingInfo: ShippingInfo;
  orderItems: OrderItem[];
  subtotal: number;
  shippingCharges: number;
  discount: number;
  total: number;
  transactionId: string;
}

export interface IOrder {
  shippingInfo: ShippingInfo;
  orderItems: OrderItem[];
  subtotal: number;
  shippingCharges: number;
  discount: number;
  total: number;
  user: Types.ObjectId;
  status: OrderStatus;
  transactionId: string;
}
