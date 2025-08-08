import z from "zod";

export const createProductZodSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name cannot exceed 100 characters" }),

  price: z.coerce
    .number()
    .positive({ message: "Price must be greater than 0" }),

  discount: z.coerce
    .number()
    .min(0, { message: "Discount must be at least 0%" })
    .max(100, { message: "Discount cannot exceed 100%" })
    .optional(),

  stock: z.coerce
    .number()
    .int({ message: "Stock must be an integer" })
    .min(0, { message: "Stock cannot be negative" }),

  category: z.string().min(1, { message: "Category is required" }),

  brand: z.string().optional(),

  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),

  photos: z.any().optional(),

  ratings: z.number().min(0).max(5).optional(),

  numOfReviews: z.number().int().min(0).optional(),
});

export const updateProductZodSchema = z.object({
  name: z.string().optional(),
  price: z.coerce.number().optional(),
  discount: z.coerce.number().optional(),
  stock: z.coerce.number().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
  photos: z.any().optional(),
  ratings: z.number().optional(),
  numOfReviews: z.number().optional(),
});
