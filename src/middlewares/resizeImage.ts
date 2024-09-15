import { Types } from "mongoose";
import catchAsync from "../util/catchAsync";
import sharp from "sharp";

export const resizeImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  const imageName = new Types.ObjectId() + ".jpeg";
  const path = `public/images/${imageName}`;
  await sharp(req.file.buffer).resize(200, 200).toFormat("jpeg").toFile(path);
  req.body.image = imageName;
  next();
});
