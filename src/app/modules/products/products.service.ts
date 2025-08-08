import {
  deleteImageFromCloudinary,
  uploadToCloudinary,
} from "../../config/cloudinary.config";
import AppError from "../../error/AppError";
import { IProducts, ProductSearchableFields } from "./products.interface";
import httpStatus from "http-status-codes";
import { Product } from "./products.model";
import { UpstashRedis } from "../../../app";
import { envVars } from "../../config/env";
import { invalidateCache } from "../../middleware/cach-revalidate";
import { QueryBuilder } from "../../utils/queryBuilder";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../user/user.model";
import { Role } from "../user/user.interface";

const redisTTL = envVars.UPSTASH_REDIS_TTL;

//*------------------------------------create new product---------------------------------------------
const newProduct = async (
  payload: IProducts,
  photos: Express.Multer.File[],
) => {
  const { name, price, stock, category, description } = payload;

  if (!photos) {
    throw new AppError(httpStatus.BAD_REQUEST, "Please provide a photo!");
  }
  if (photos.length < 1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Please provide at least one photo!",
    );
  }

  if (photos.length > 5) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can upload a maximum of 5 photos!",
    );
  }

  if (!name || !price || !stock || !category || !description) {
    throw new AppError(httpStatus.BAD_REQUEST, "Please provide all fields");
  }
  if (price < 0 || stock < 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Price or stock cannot be negative",
    );
  }

  if (photos) {
    const photosUrl = await uploadToCloudinary(photos, "product");
    payload.photos = photosUrl;
  }

  const result = await Product.create(payload);
  await invalidateCache({ product: true, admin: true });

  return result;
};

//*------------------------------------updateProduct product---------------------------------------------
const updateProduct = async (
  productId: string,
  payload: IProducts,
  photos: Express.Multer.File[],
  decodedToken: JwtPayload,
) => {
  const { name, price, stock, category, description, brand, discount } =
    payload;

  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product not found!");
  }

  const user = await User.findById(decodedToken.userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (product.isSecure && user.role !== Role.SUPER_ADMIN) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This Product can edit only Super Admin",
    );
  }

  if (photos && photos.length > 0) {
    const photosUrl = await uploadToCloudinary(photos, "product");
    if (photosUrl.length) {
      const ids = product.photos.map((photo) => photo.public_id);
      await deleteImageFromCloudinary(ids);
    }

    product.photos.splice(0, product.photos.length, ...photosUrl);
  }

  product.name = name ?? product.name;
  product.price = price ?? product.price;
  product.stock = stock ?? product.stock;
  product.category = category?.toLowerCase() ?? product.category;
  product.brand = brand?.toLowerCase() ?? product.brand;
  product.discount = discount ?? product.discount;
  product.description = description ?? product.description;
  await product.save();

  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return product;
};

//*------------------------------------get Single Product ---------------------------------------------

const getSingleProduct = async (productId: string) => {
  const key = `product-${productId}`;
  let product;
  const cached = await UpstashRedis.get(key);
  if (cached) {
    product = JSON.parse(cached);
  } else {
    product = await Product.findById(productId);
    if (!product) {
      throw new AppError(httpStatus.BAD_REQUEST, "Product not found!");
    }
    await UpstashRedis.setex(key, redisTTL, JSON.stringify(product));
  }
  return product;
};

//*------------------------------------Delete Product ---------------------------------------------

const deleteProduct = async (productId: string, decodedToken: JwtPayload) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product not found!");
  }

  const user = await User.findById(decodedToken.userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (product.isSecure && user.role !== Role.SUPER_ADMIN) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This Product can Delete only Super Admin",
    );
  }

  const ids = product.photos.map((photo) => photo.public_id);
  await deleteImageFromCloudinary(ids);

  await product.deleteOne();
  await invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });
};

//*------------------------------------Get All Product ---------------------------------------------
// GET /api/products?sort=-numOfReviews,-rating
// GET /api/products?sort=-createdAt
// GET /api/products?sort=createdAt
// GET /api/products?category=electronics&sort=createdAt
// GET /api/products?sort=price
// GET /api/products?sort=-price
// GET /api/products?category=electronics&rating=4,5&price[gte]=100&price[lte]=1000&sort=-price
//
const getAllProducts = async (query: Record<string, any>) => {
  let products;
  let meta;

  const filterQuery: Record<string, any> = { ...query };

  Object.keys(query).forEach((key) => {
    const match = key.match(/^(\w+)\[(gte|lte|gt|lt)\]$/);
    if (match) {
      const field = match[1]; // e.g., "price"
      const operator = match[2]; // e.g., "gte"
      if (!filterQuery[field]) filterQuery[field] = {};
      filterQuery[field][`$${operator}`] = Number(query[key]);
      delete filterQuery[key]; // clean up original key
    }
  });

  if (
    filterQuery.rating &&
    typeof filterQuery.rating === "string" &&
    filterQuery.rating.includes(",")
  ) {
    filterQuery.rating = {
      $in: filterQuery.rating.split(",").map(Number),
    };
  }

  const encodeQueryKey = (query: Record<string, string>) => {
    return Object.entries(query)
      .sort()
      .map(([key, val]) => `${key}:${encodeURIComponent(val)}`)
      .join("|");
  };

  const key = `products:filter:${encodeQueryKey(query)}`;

  const cached = await UpstashRedis.get(key);

  if (cached) {
    const data = JSON.parse(cached);
    products = data.products;
    meta = data.meta;
  } else {
    const queryBuilder = new QueryBuilder(Product.find(), filterQuery);

    const ProductsData = queryBuilder
      .search(ProductSearchableFields)
      .filter()
      .sort()
      .fields()
      .paginate();

    const [data, metaData] = await Promise.all([
      ProductsData.build(),
      queryBuilder.getMeta(),
    ]);
    products = data;
    meta = metaData;
    await UpstashRedis.setex(key, redisTTL, JSON.stringify({ products, meta }));
  }

  return {
    products,
    meta,
  };
};

//*------------------------------------get getPriceRange ---------------------------------------------

const getPriceRange = async () => {
  const result = await Product.aggregate([
    {
      $group: {
        _id: null,
        minPrice: { $min: "$discountPrice" },
        maxPrice: { $max: "$discountPrice" },
      },
    },
  ]);

  if (!result.length) {
    // No products found - default values
    return { minPrice: 0, maxPrice: 100 };
  }

  const { minPrice, maxPrice } = result[0];
  return {
    minPrice,
    maxPrice,
  };
};

//*------------------------------------get categories ---------------------------------------------

const categories = async () => {
  let categories;
  const cached = await UpstashRedis.get("categories");
  if (cached) {
    categories = JSON.parse(cached);
  } else {
    categories = await Product.find({}).distinct("category");
    if (!categories) {
      throw new AppError(httpStatus.NOT_FOUND, "Categories not found");
    }
    await UpstashRedis.set("categories", JSON.stringify(categories));
  }
  return categories;
};

export const ProductsService = {
  newProduct,
  updateProduct,
  getSingleProduct,
  deleteProduct,
  getAllProducts,
  getPriceRange,
  categories,
};
