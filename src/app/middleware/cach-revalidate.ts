import { UpstashRedis } from "../../app";
import { InvalidateCacheProps } from "../interface/types";

export const invalidateCache = async ({
  product,
  order,
  admin,
  review,
  userId,
  orderId,
  productId,
}: InvalidateCacheProps) => {
  if (review) {
    await UpstashRedis.del([`reviews-${productId}`]);
  }

  if (product) {
    const productKeys: string[] = [
      "latest-products",
      "categories",
      "all-products",
    ];

    if (typeof productId === "string") productKeys.push(`product-${productId}`);

    if (typeof productId === "object")
      productId.forEach((i) => productKeys.push(`product-${i}`));
    let cursor = "0";
    do {
      const [nextCursor, matchedKeys] = await UpstashRedis.scan(
        cursor,
        "MATCH",
        "products:filter:*",
        "COUNT",
        100,
      );
      cursor = nextCursor;
      productKeys.push(...matchedKeys);
    } while (cursor !== "0");

    if (productKeys.length > 0) {
      await UpstashRedis.del(...productKeys);
    }
  }
  if (order) {
    const ordersKeys: string[] = [
      "all-orders",
      `my-orders-${userId}`,
      `order-${orderId}`,
    ];
    if (ordersKeys.length > 0) {
      await UpstashRedis.del(...ordersKeys);
    }
  }

  if (admin) {
    const adminKeys = [
      "admin-stats",
      "admin-pie-charts",
      "admin-bar-charts",
      "admin-line-charts",
    ];

    if (adminKeys.length > 0) {
      await UpstashRedis.del(...adminKeys);
    }
  }
};
