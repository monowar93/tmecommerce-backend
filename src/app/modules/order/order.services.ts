import { JwtPayload } from "jsonwebtoken";
import AppError from "../../error/AppError";
import { OrderPayload, OrderStatus } from "./order.interface";
import { Order } from "./order.model";
import { reduceStock } from "../../utils/reduceStock";
import { invalidateCache } from "../../middleware/cach-revalidate";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import { UpstashRedis } from "../../../app";
import { envVars } from "../../config/env";
import { Role } from "../user/user.interface";

const redisTTL = envVars.UPSTASH_REDIS_TTL;

//*---------------------------------------------------------------create new order-----------------------------------------
const newOrder = async (payload: OrderPayload, decodedToken: JwtPayload) => {
  const {
    shippingInfo,
    orderItems,
    subtotal,
    shippingCharges,
    discount,
    total,
    transactionId,
  } = payload;

  const userId = decodedToken.userId;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!shippingInfo || !orderItems || !subtotal || !total) {
    throw new AppError(400, "Please Enter all field");
  }

  const order = await Order.create({
    shippingInfo,
    orderItems,
    user: userId,
    subtotal,
    shippingCharges,
    discount,
    total,
    transactionId,
  });

  await reduceStock(orderItems);
  await invalidateCache({
    product: true,
    order: true,
    admin: true,
    userId: userId,
    productId: order.orderItems.map((i) => String(i.productId)),
  });

  return order;
};

//*---------------------------------------------------------------My orders-----------------------------------------
const myOrders = async (decodedToken: JwtPayload) => {
  const userId = decodedToken.userId;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  const key = `my-orders-${user._id}`;
  let orders;
  const cached = await UpstashRedis.get(key);
  if (cached) {
    orders = JSON.parse(cached);
  } else {
    orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    if (!orders) {
      throw new AppError(httpStatus.NOT_FOUND, "Order not found");
    }
    await UpstashRedis.setex(key, redisTTL, JSON.stringify(orders));
  }

  return orders;
};

//*---------------------------------------------------------------All orders-----------------------------------------
const allOrders = async () => {
  const key = `all-orders`;
  let orders;
  const cached = await UpstashRedis.get(key);
  if (cached) {
    orders = JSON.parse(cached);
  } else {
    orders = await Order.find()
      .populate("user", "name")
      .sort({ createdAt: -1 });

    if (!orders) {
      throw new AppError(httpStatus.NOT_FOUND, "Orders not found");
    }
    await UpstashRedis.setex(key, redisTTL, JSON.stringify(orders));
  }

  return orders;
};

//*---------------------------------------------------------------get single order-----------------------------------------
const getSingleOrder = async (id: string) => {
  const key = `order-${id}`;

  let order;
  const cached = await UpstashRedis.get(key);

  if (cached) {
    order = JSON.parse(cached);
  } else {
    order = await Order.findById(id).populate("user", "name email");
    if (!order) {
      throw new AppError(httpStatus.NOT_FOUND, "Order not found");
    }
    await UpstashRedis.setex(key, redisTTL, JSON.stringify(order));
  }
  return order;
};

//*---------------------------------------------------------------update order status-----------------------------------------
const processOrder = async (
  userId: string,
  orderId: string,
  updateData: { status: OrderStatus },
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid user account");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError(httpStatus.NOT_FOUND, "Order not found");
  }

  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PROCESSING]: [
      OrderStatus.SHIPPED,
      OrderStatus.CANCELLED,
      OrderStatus.DELIVERED,
    ],
    [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  if (!updateData.status) {
    throw new AppError(httpStatus.BAD_REQUEST, "Status is required");
  }

  const allowedNextStatuses = validTransitions[order.status];
  if (!allowedNextStatuses.includes(updateData.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You cannot change status from ${order.status} to ${updateData.status}`,
    );
  }

  if (
    updateData.status === OrderStatus.SHIPPED ||
    updateData.status === OrderStatus.DELIVERED
  ) {
    if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
      throw new AppError(httpStatus.BAD_REQUEST, "You are not authorized");
    }
  }

  order.status = updateData.status;

  await order.save();

  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.user.toString(),
    orderId: String(order._id),
  });

  return order;
};

//All exports
export const OrderServices = {
  newOrder,
  myOrders,
  allOrders,
  getSingleOrder,
  processOrder,
};
