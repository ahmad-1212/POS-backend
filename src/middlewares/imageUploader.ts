import createHttpError from "http-errors";
import { Request } from "express";
import multer, { FileFilterCallback } from "multer";

// Use multer memoryStorage to store the file in memory
const storage = multer.memoryStorage();

// Define a file filter to allow only image files
const filter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true); // Accept the file
  } else {
    // Reject the file with an error
    cb(createHttpError(400, "The provided file is not an image!"));
  }
};

// Export the imageUploader
export const imageUploader = multer({
  storage,
  fileFilter: filter,
});
