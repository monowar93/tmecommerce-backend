/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import stream from "stream";
import AppError from "../error/AppError";
import { envVars } from "./env";

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const deleteImageFromCloudinary = async (
  public_id: string[] | string,
): Promise<void> => {
  try {
    const ids = Array.isArray(public_id) ? public_id : [public_id];
    const deletePromises = ids.map((id) => {
      return new Promise<void>((resolve, reject) => {
        cloudinary.uploader.destroy(id, (error, result) => {
          if (error || result?.result !== "ok") {
            return reject(error || new Error(`Failed to delete: ${id}`));
          }
          resolve();
        });
      });
    });

    await Promise.all(deletePromises);
  } catch (error: any) {
    console.error("Cloudinary deletion error:", error);
    throw new AppError(401, "Cloudinary image deletion failed", error.message);
  }
};

export const uploadToCloudinary = async (
  files: Express.Multer.File | Express.Multer.File[],
  type: "profile" | "product" | "invoice" = "product",
) => {
  const fileArray = Array.isArray(files) ? files : [files];

  if (fileArray.length === 0) {
    throw new AppError(400, "No files provided for upload.");
  }

  try {
    const folderMap = {
      profile: "tm_ecommerce/profile_image",
      product: "tm_ecommerce/products_image",
      invoice: "tm_ecommerce/invoice_pdf",
    };

    const uploadSingle = (
      file: Express.Multer.File,
    ): Promise<UploadApiResponse> => {
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1e6);

      const cleanFileName = file.originalname
        .toLowerCase()
        .replace(/\.[^/.]+$/, "")
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
      const public_id = `${folderMap[type]}/${cleanFileName}-${timestamp}-${randomSuffix}`;
      const bufferStream = new stream.PassThrough();
      bufferStream.end(file.buffer);

      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            public_id,
            resource_type:
              file.mimetype === "application/pdf" ? "raw" : "image",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result!);
          },
        );
        bufferStream.pipe(stream);
      });
    };

    const uploadPromises = fileArray.map(uploadSingle);
    const results = await Promise.all(uploadPromises);

    return results.map((res) => ({
      public_id: res.public_id,
      url: res.secure_url,
    }));
  } catch (error: any) {
    console.log(error);
    throw new AppError(401, `Error uploading to Cloudinary: ${error.message}`);
  }
};

// await uploadBufferToCloudinary(fileBuffer, "Green Shirt", "product");

// await uploadBufferToCloudinary(fileBuffer, "Invoice August 2025", "invoice");

// await uploadBufferToCloudinary(fileBuffer, "Tarek Profile", "profile");

export const cloudinaryUpload = cloudinary;
