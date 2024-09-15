import { NextFunction, Request, Response } from "express";
import { isHttpError } from "http-errors";
import env from "../config/env";

type ErrFunc = (err: any, res: Response) => void;

/**
 * Function to handle Duplicate field error
 */
const handleDuplicateError: ErrFunc = (err, res) => {
  const duplicateValue = err.errorResponse.keyValue;
  const message = `${Object.keys(duplicateValue)[0]}: ${
    Object.values(duplicateValue)[0]
  } already exists, please use another one!`;
  return res.status(400).json({
    status: "fail",
    message,
  });
};

/**
 * Function to handle validation error
 */
const handleValidationError: ErrFunc = (err, res) => {
  const { errors } = err;
  const message = Object.keys(errors)
    .map((key: any) => errors[key])
    .map((obj) => obj.message)
    .join(", ");
  return res.status(400).json({
    status: "fail",
    message,
  });
};

/**
 * Function to send error when development mode
 */
const handleDevError: ErrFunc = (err, res) => {
  const errObj = {
    status: "error",
    message: (err as Error).message,
    err: err as Error,
    stack: (err as Error).stack,
  };
  return res.status(isHttpError(err) ? err.statusCode : 500).json(errObj);
};

/**
 * Function to send error while in production mode
 */
const handleProError: ErrFunc = (err, res) => {
  // If operational error
  if (isHttpError(err)) {
    const errObj = {
      status: "error",
      message: (err as Error).message,
    };
    return res.status(isHttpError(err) ? err.statusCode : 500).json(errObj);
  }
  // Handle duplicate field error
  else if ((err as any)?.errorResponse?.code === 11000)
    handleDuplicateError(err, res);
  // Handle validation error
  else if ((err as any)?.name === "ValidationError")
    handleValidationError(err, res);
  else
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
};

const errorController = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If in dev
  if (env.isDev) {
    console.log("Err:dev");
    handleDevError(err, res);
  }

  // If in Prod
  if (env.isProd) handleProError(err, res);
};

export default errorController;
