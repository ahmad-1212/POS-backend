import { RequestHandler } from "express";
import catchAsync from "../util/catchAsync";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import env from "../config/env";
import User from "../models/userModel";

export const protect: RequestHandler = catchAsync(async (req, res, next) => {
  let token: string | undefined;

  // Check if the authorization header is present and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // If no token is present, return an error
  if (!token) {
    return next(
      createHttpError(
        401,
        "You are not logged in. Please log in to get access!"
      )
    );
  }

  let decoded: any;
  try {
    // Verify the token
    decoded = jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    return next(
      createHttpError(401, "Invalid or expired token. Please log in again.")
    );
  }

  // Find the user by ID
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      createHttpError(401, "Invalid or expired token. Please log in again.")
    );
  }

  // Check if the token matches the token stored in the user record
  if (user.token !== token) {
    return next(createHttpError(401, "Invalid or expired token!"));
  }

  // Attach user information to the res.locals object (optional)
  const { password, token: utoken, ...userInfo } = user.toObject();
  res.locals.user = userInfo;

  next();
});
