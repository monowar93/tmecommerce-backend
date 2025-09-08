import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ProductsService } from "./products.service";
import { JwtPayload } from "jsonwebtoken";

//*------------------------------------------------------------------create product--------------------------------------
const newProduct = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const photos = req.files as Express.Multer.File[];

  const result = await ProductsService.newProduct(payload, photos);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Product created",
    data: result,
  });
});

//*------------------------------------------------------------------update product--------------------------------------
const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const photos = req.files as Express.Multer.File[];
  const productId = req.params.id;
  const decodedToken = req.user;

  const result = await ProductsService.updateProduct(
    productId,
    payload,
    photos,
    decodedToken as JwtPayload,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Product update successful",
    data: result,
  });
});

//*------------------------------------------------------------------get single product--------------------------------------

const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.id;

  const result = await ProductsService.getSingleProduct(productId);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Product details retrieved successful",
    data: result,
  });
});

//*------------------------------------------------------------------Delete product--------------------------------------

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.id;
  const decodedToken = req.user;
  const result = await ProductsService.deleteProduct(
    productId,
    decodedToken as JwtPayload,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Product Delete successful",
    data: result,
  });
});

//*------------------------------------------------------------------Get All product--------------------------------------

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ProductsService.getAllProducts(
    query as Record<string, string>,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "All products retrieved successful",
    data: result.products,
    meta: result.meta,
  });
});

//*------------------------------------------------------------------Get some product--------------------------------------

const getSomeProducts = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await ProductsService.getSomeProducts(
    query as Record<string, string>,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Products retrieved successful",
    data: result.products,
    meta: result.meta,
  });
});

//*------------------------------------------------------------------Get getPriceRange --------------------------------------

const getPriceRange = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductsService.getPriceRange();

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Price Range retrieved successful",
    data: result,
  });
});

//*------------------------------------------------------------------Get categories --------------------------------------

const categories = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductsService.categories();

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "All categories retrieved successful",
    data: result,
  });
});

export const ProductsControllers = {
  newProduct,
  updateProduct,
  getSingleProduct,
  deleteProduct,
  getAllProducts,
  getSomeProducts,
  getPriceRange,
  categories,
};
