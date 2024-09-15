import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

/**
 *Function to restrict user from certain action
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(res.locals.user.role))
      return next(
        createHttpError(403, "You are not allowed to perform this action!")
      );

    return next();
  };
};
