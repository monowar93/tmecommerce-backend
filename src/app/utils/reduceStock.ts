import { OrderItem } from "../modules/order/order.interface";
import { Product } from "../modules/products/products.model";

export const reduceStock = async (orderItems: OrderItem[]) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    const product = await Product.findById(order.productId);
    if (!product) throw new Error("Product Not Found");
    product.stock -= order.quantity;
    await product.save();
  }
};
