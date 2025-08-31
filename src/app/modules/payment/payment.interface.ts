export interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  pinCode: number;
}

export type CartItem = {
  productId: string;
  photo: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
};

export interface IIntent {
  cartItems: CartItem[];
  shippingInfo: ShippingInfo;
  coupon?: string;
}
