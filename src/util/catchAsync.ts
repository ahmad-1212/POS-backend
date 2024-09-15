import { RequestHandler } from "express";

const catchAsync = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync;
