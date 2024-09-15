import { RequestHandler } from "express";
import catchAsync from "../util/catchAsync";
import productService from "../services/productService";
import { ProductDto, UpdateProductDto } from "../dtos/product.dto";
import { Types } from "mongoose";

/**
 * Function to create product
 */
export const addProduct: RequestHandler<{}, {}, ProductDto> = catchAsync(
  async (req, res) => {
    const newProduct = await productService.addProduct(req.body);

    res.status(201).json({
      status: "success",
      message: "Product successfully created!",
      data: {
        product: newProduct,
      },
    });
  }
);

/**
 * Function to get all products
 */
export const getAllProducts: RequestHandler = catchAsync(async (req, res) => {
  const products = await productService.getAllProducts();
  res.status(200).json({
    status: "success",
    length: products.length,
    data: {
      products,
    },
  });
});
/**
 * Function to get product by id
 */
export const getProduct: RequestHandler<{ id: string }> = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const newObjId = new Types.ObjectId(id);
    const product = await productService.getProduct(newObjId);
    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  }
);

/**
 * Function to update product
 */
export const updateProduct: RequestHandler<
  { id: string },
  {},
  UpdateProductDto
> = catchAsync(async (req, res) => {
  const { id } = req.params;
  const newObjId = new Types.ObjectId(id);
  const updatedProduct = await productService.updateProduct(newObjId, req.body);

  res.status(200).json({
    status: "success",
    message: "Product successfully updated!",
    data: {
      product: updatedProduct,
    },
  });
});

/**
 * Function to delete product
 */
export const deleteProduct: RequestHandler<{ id: string }> = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const newObjId = new Types.ObjectId(id);
    await productService.deleteProduct(newObjId);
    res.status(200).json({
      status: "success",
      message: "Product successfully deleted!",
    });
  }
);
