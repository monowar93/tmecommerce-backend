import { Types } from "mongoose";

export const ProductSearchableFields = ["name", "category", "brand"];

export interface IProducts {
  _id?: Types.ObjectId;
  name: string;
  price: number;
  discountPrice?: number;
  discount?: number;
  stock: number;
  category: string;
  brand?: string;
  description: string;
  ratings?: number;
  numOfReviews?: number;
  photos: {
    url: string;
    public_id: string;
  }[];
  createdAt?: Date;
  isSecure?: boolean;
}

export type Review = {
  rating: number;
  comment: string;
  product: string;
  user: {
    name: string;
    photo: string;
    _id: string;
  };
  _id: string;
};
