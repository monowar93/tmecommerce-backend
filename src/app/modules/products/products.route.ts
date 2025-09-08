import express from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../user/user.interface";
import { multiUpload } from "../../config/multer.config";
import { validateRequest } from "../../middleware/validateRequest";
import {
  createProductZodSchema,
  updateProductZodSchema,
} from "./products.validation";
import { ProductsControllers } from "./products.controller";
const router = express.Router();

// Create new product - /api/v1/product/new
router.post(
  "/new",
  multiUpload("photos"),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createProductZodSchema),
  ProductsControllers.newProduct,
);

// Get all product with filter - /api/v1/product/all
router.get("/all", ProductsControllers.getAllProducts);

// Get all product with ids array for wishlist
router.get("/some", ProductsControllers.getSomeProducts);

// Get price - /api/v1/product/price-range
router.get("/price-range", ProductsControllers.getPriceRange);

// Get all categories - /api/v1/product/categories
router.get("/categories", ProductsControllers.categories);

// Update product - /api/v1/product/:id
router.patch(
  "/:id",
  multiUpload("photos"),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateProductZodSchema),
  ProductsControllers.updateProduct,
);

// Get single product details - /api/v1/product/:id
router.get("/:id", ProductsControllers.getSingleProduct);

// Delete Product - /api/v1/product/:id
router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  ProductsControllers.deleteProduct,
);

export const ProductsRoutes = router;
