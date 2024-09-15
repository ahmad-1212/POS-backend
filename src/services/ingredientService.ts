import { Types } from "mongoose";
import { IngredientDto } from "../dtos/ingredient.dto";
import { IIngredient } from "../interfaces/ingredient.interface";
import Ingredient from "../models/ingredientModel";
import createHttpError from "http-errors";
import Product from "../models/productModel";
import MainInventory from "../models/mainInventoryModel";
import KitchenInventory from "../models/kitchenModel";

class IngredientService {
  /**
   * Creates a new ingredient document in the database.
   *
   * @param {IngredientDto} ingData - The data for the new ingredient, including necessary fields.
   * @returns {Promise<IIngredient>} - A promise that resolves to the created ingredient document.
   *
   * @throws {Error} If there is an issue creating the ingredient, such as a database error.
   */
  public async addIngredient(ingData: IngredientDto): Promise<IIngredient> {
    // Create a new ingredient using the provided data
    const ingredient = await Ingredient.create(ingData);
    return ingredient;
  }

  /**
   * Retrieves all ingredient documents from the database.
   *
   * @returns {Promise<IIngredient[]>} - A promise that resolves to an array of all ingredient documents.
   *
   * @throws {Error} If there is an issue retrieving the ingredients, such as a database error.
   */
  public async getAllIngredients(): Promise<IIngredient[]> {
    // Find and return all ingredients
    const ingredients = await Ingredient.find();
    return ingredients;
  }

  /**
   * Updates an existing ingredient by its ID.
   *
   * @param {Types.ObjectId} id - The ID of the ingredient to update.
   * @param {IngredientDto} ingData - The updated data for the ingredient.
   * @returns {Promise<IIngredient>} - A promise that resolves to the updated ingredient document.
   *
   * @throws {createHttpError} If the ingredient with the specified ID is not found.
   */
  public async updateIngredient(
    id: Types.ObjectId,
    ingData: IngredientDto
  ): Promise<IIngredient> {
    // Update the ingredient by ID and return the updated document
    const updateIngredient = await Ingredient.findByIdAndUpdate(id, ingData, {
      new: true, // Return the updated document
    });

    // Throw an error if the ingredient is not found
    if (!updateIngredient)
      throw createHttpError(404, `No ingredient found with the ID: ${id}`);

    return updateIngredient;
  }

  /**
   * Deletes an ingredient document by its ID.
   *
   * @param {Types.ObjectId} id - The ID of the ingredient to delete.
   * @returns {Promise<void>} - A promise that resolves when the ingredient is deleted.
   *
   * @throws {Error} If there is an issue deleting the ingredient, such as a database error.
   */
  public async deletIngredient(id: Types.ObjectId): Promise<void> {
    await Product.updateMany(
      {
        "ingredients.ingredient": id,
      },
      {
        $pull: { ingredients: { ingredient: id } },
      }
    );

    await MainInventory.deleteMany({ ingredient: id });

    await KitchenInventory.deleteMany({ ingredient: id });
    // Delete the ingredient by ID
    await Ingredient.findByIdAndDelete(id);
  }
}

export default new IngredientService();
