import { RequestHandler } from "express";
import catchAsync from "../util/catchAsync";
import { CategoryAddDto, CategoryUpdateDto } from "../dtos/category.dto";
import categoriesService from "../services/categoriesService";
import { Types } from "mongoose";

/**
 * Function to add Category
 */
export const addCategory: RequestHandler<{}, {}, CategoryAddDto> = catchAsync(
  async (req, res) => {
    const { name, image } = req.body;
    const newCat = await categoriesService.addCategory({ name, image });
    res.status(201).json({
      status: "success",
      message: "Category successfully created!",
      data: {
        newCategory: newCat,
      },
    });
  }
);

/**
 * Function to update category
 */

export const updateCategory: RequestHandler<
  { id: string },
  {},
  CategoryUpdateDto
> = catchAsync(async (req, res) => {
  const { id } = req.params;

  const newObjectId = new Types.ObjectId(id);
  const { image, name } = req.body;
  const updatedCategory = await categoriesService.updateCategory(newObjectId, {
    image,
    name,
  });
  res.status(200).json({
    status: "success",
    message: "Category successfully updated!",
    data: {
      updatedCategory,
    },
  });
});

/**
 * Get All Categories
 */
export const getAllCategories: RequestHandler = catchAsync(async (req, res) => {
  const categories = await categoriesService.getAllCategories();

  res.status(200).json({
    status: "success",
    length: categories.length,
    data: {
      categories,
    },
  });
});

/**
 * Function to delete category
 */
export const deleteCategory: RequestHandler<{ id: string }> = catchAsync(
  async (req, res) => {
    const { id } = req.params;
    const newObjectId = new Types.ObjectId(id);
    await categoriesService.deleteCategory(newObjectId);
    res.status(200).json({
      status: "success",
      message: "Category successfully deleted!",
    });
  }
);
