import mongoose from "mongoose";
import { IProducts } from "./products.interface";
import { boolean } from "zod";

const ProductSchema = new mongoose.Schema<IProducts>(
  {
    name: {
      type: String,
      required: [true, "Please enter Product Name"],
    },
    price: {
      type: Number,
      required: [true, "Please enter product Price"],
    },
    discount: {
      type: Number,
      default: 0,
    },
    discountPrice: {
      type: Number,
    },
    stock: {
      type: Number,
      required: [true, "Please enter product Stock"],
    },
    category: {
      type: String,
      required: [true, "Please enter product category"],
      trim: true,
    },
    brand: {
      type: String,
    },
    description: {
      type: String,
      required: [true, "Please enter product Description"],
    },
    photos: [
      {
        public_id: {
          type: String,
          required: [true, "Please enter product image public_id"],
        },
        url: {
          type: String,
          required: [true, "Please enter product image URL"],
        },
      },
    ],
    ratings: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    isSecure: {
      type: boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  },
);

// Pre-save hook (for .save())
ProductSchema.pre("save", function (next) {
  if (this.price && this.discount) {
    const discountPrice = this.price - (this.price * this.discount) / 100;
    this.discountPrice = Number(discountPrice.toFixed(2));
  } else {
    this.discountPrice = this.price;
  }
  next();
});

// Pre-findOneAndUpdate hook (for .findByIdAndUpdate, etc.)
ProductSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as Partial<IProducts>;

  if (update.price && update.discount !== undefined) {
    const discountPrice = update.price - (update.price * update.discount) / 100;
    update.discountPrice = Number(discountPrice.toFixed(2));
  } else if (update.price) {
    update.discountPrice = update.price;
  }
  this.setUpdate(update);
  next();
});

export const Product = mongoose.model<IProducts>("Product", ProductSchema);
