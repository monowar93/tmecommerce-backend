import multer from "multer";

const storage = multer.memoryStorage();

export const singleUpload = (fieldName: string) =>
  multer({ storage }).single(fieldName);

export const multiUpload = (fieldName: string, maxCount = 5) =>
  multer({ storage }).array(fieldName, maxCount);

// router.post("/upload-avatar", singleUpload("avatar"), handler);
// router.post("/upload-images", multiUpload("images", 10), handler);
