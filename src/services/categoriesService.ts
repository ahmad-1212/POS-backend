import { Types } from "mongoose";
import { CategoryAddDto, CategoryUpdateDto } from "../dtos/category.dto";
import { ICategory } from "../interfaces/category.interface";
import Category from "../models/categoryModel";
import createHttpError from "http-errors";
import { deleteImage } from "../util/deleteImage";
import Product from "../models/productModel";

class CategoryService {
  /**
   * Creates a new category document in the database.
   *
   * @param {CategoryAddDto} catData - The data for the new category, including necessary fields.
   * @returns {Promise<ICategory>} - A promise that resolves to the created category document.
   *
   * @throws {Error} If there is an issue creating the category, such as a database error.
   */
  public async addCategory(catData: CategoryAddDto): Promise<ICategory> {
    // Create a new category using the provided data
    const newCategory = await Category.create(catData);

    return newCategory;
  }

  /**
   * Updates an existing category by its ID.
   *
   * @param {Types.ObjectId} id - The ID of the category to update.
   * @param {CategoryUpdateDto} catData - The updated data for the category.
   * @returns {Promise<ICategory>} - A promise that resolves to the updated category document.
   *
   * @throws {createHttpError} If the category with the specified ID is not found.
   */
  public async updateCategory(
    id: Types.ObjectId,
    catData: CategoryUpdateDto
  ): Promise<ICategory> {
    const { name, image } = catData;

    const isCategory = await Category.findById(id);
    if (!isCategory)
      throw createHttpError(404, "Category not found with ID: " + id);
    const oldImage = isCategory.image;
    isCategory.name = name;
    if (image) isCategory.image = image;
    const updatedCategory = await isCategory.save();
    if (image && oldImage) {
      deleteImage(oldImage);
    }

    return updatedCategory;
  }

  /**
   * Deletes a category document by its ID.
   *
   * @param {Types.ObjectId} id - The ID of the category to delete.
   * @returns {Promise<void>} - A promise that resolves when the category is deleted.
   *
   * @throws {Error} If there is an issue deleting the category, such as a database error.
   */
  public async deleteCategory(id: Types.ObjectId): Promise<void> {
    const isCategory = await Category.findById(id);
    const isProductWithCategory = await Product.find({
      category: id,
      deleted: { $ne: true },
    });
    if (isProductWithCategory.length > 0) {
      throw createHttpError(
        400,
        `Cannot delete category because the following Products: "${isProductWithCategory
          .map((prd) => prd.name)
          .join(", ")}" are attached to this category!`
      );
    }
    if (isCategory!.image) {
      deleteImage(isCategory!.image);
    }

    // Delete the category by ID
    await Category.findByIdAndDelete(id);
  }

  /**
   * Retrieves all category documents from the database.
   *
   * @returns {Promise<ICategory[]>} - A promise that resolves to an array of all category documents.
   *
   * @throws {Error} If there is an issue retrieving the categories, such as a database error.
   */
  public async getAllCategories(): Promise<ICategory[]> {
    // Find and return all categories
    const categories = await Category.find();
    return categories;
  }
}

export default new CategoryService();
